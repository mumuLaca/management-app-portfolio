import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "@/lib/dayjs";
import { AbsentData, WorkStyle } from "@/lib/constants";
import { getAbsentDataKey } from "@/utils/constantsUtil";
import {
  calcActiveTime,
  calcLateNightOverTime,
  calcLegalHolidayActiveTime,
  calcOverTime,
} from "@/utils/caluculationTimeUtil";

type Params = {
  id: string;
  targetDate: string[];
  startTime: string;
  endTime: string;
  rest: string;
  workStyle: string;
  absentCode: string;
  note: string;
};

type UpdateData = {
  startTime?: Date | null;
  endTime?: Date | null;
  rest?: number | null;
  workStyle?: string;
  absentCode?: string;
  note?: string;
};

interface AbsentDataItem {
  code: string;
  allday: boolean;
}

/**
 * @description
 * 勤務表‗更新処理
 *
 * @param request NextRequest object
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Params;

    if (!body.id || !body.targetDate?.length) {
      return NextResponse.json(
        {
          errorCode: "INVALID_PARAMETERS",
          message: "必要なパラメータが不足しています。",
        },
        { status: 400 }
      );
    }

    const currentMonth = dayjs.utc(body.targetDate[0]).startOf("month");
    const nextMonth = currentMonth.add(1, "month");
    const yearMonth = currentMonth.format("YYYYMM");

    const startTime = body.startTime
      ? dayjs.utc(body.startTime, "HH:mm").toDate()
      : null;
    const endTime = body.endTime
      ? dayjs.utc(body.endTime, "HH:mm").toDate()
      : null;
    const rest = body.rest ? parseFloat(body.rest) : null;

    const updateTargetCodes = (Object.values(AbsentData) as AbsentDataItem[])
      .filter(
        (item) => !item.allday && item.code !== AbsentData.companyEvent.code
      )
      .map((item) => item.code);

    const updateData: UpdateData = {};
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (rest == 0 || rest) updateData.rest = rest;
    if (body.workStyle) updateData.workStyle = body.workStyle;
    if (body.absentCode) updateData.absentCode = body.absentCode;
    if (body.note) updateData.note = body.note;

    if (
      body.absentCode &&
      AbsentData[getAbsentDataKey(body.absentCode)].allday
    ) {
      updateData.startTime = null;
      updateData.endTime = null;
      updateData.rest = null;
      updateData.workStyle = WorkStyle.none.code;
      updateData.note = body.note ? body.note : "";
    }

    await prisma.$transaction(async () => {
      const updateDate = await prisma.attendance.findMany({
        where: {
          employeeId: parseInt(body.id),
          date: {
            in: Object.values(body.targetDate).map((item) =>
              dayjs.utc(item).toDate()
            ),
          },
          absentCode: {
            in: updateTargetCodes,
          },
        },
      });

      // 更新処理
      // 区分が休日扱いのものは更新対象外
      const query = updateDate.map((item) => {
        return prisma.attendance.update({
          where: {
            employeeId_date: { employeeId: parseInt(body.id), date: item.date },
            absentCode: {
              in: updateTargetCodes,
            },
          },
          data: updateData,
        });
      });

      await prisma.$transaction(query);

      // ============================ 共通処理 ============================
      // メンバーIDに紐づく勤務表データを取得
      const attendanceList = await prisma.attendance.findMany({
        where: {
          AND: [
            {
              employeeId: parseInt(body.id),
            },
            {
              date: {
                gte: currentMonth.toDate(),
                lt: nextMonth.toDate(),
              },
            },
          ],
        },
        orderBy: {
          date: "asc",
        },
      });

      // 返却用データを作成
      const customAttendance = attendanceList.map((row) => {
        // 各計算結果を変数に保存
        const activeTime = calcActiveTime(row); // 稼働時間
        const overTime = calcOverTime(row); //残業時間
        const lNOverTime = calcLateNightOverTime(row); // 深夜残業時間
        const legalHolActive = calcLegalHolidayActiveTime(row); // 法定休日勤務時間

        // 既存のrowオブジェクトに計算結果を追加して新しいオブジェクトを返す
        return {
          key: dayjs.utc(row.date).format("YYYYMMDD"),
          ...row, // 元のオブジェクトをコピー
          activeTime,
          overTime,
          lNOverTime,
          legalHolActive,
        };
      });

      // 承認状況の総稼働時間を更新し、合わせてデータ取得
      await prisma.approval.update({
        where: {
          employeeId_yearMonth: {
            employeeId: parseInt(body.id),
            yearMonth: yearMonth,
          },
        },
        data: {
          totalActive: customAttendance.reduce((sum, row) => {
            return sum + (row.activeTime ?? 0);
          }, 0),
        },
      });
    });

    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    console.error("error", error);
    return NextResponse.json(
      {
        errorCode: "UNKNOWN_ERROR",
        message: "データの更新中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}
