import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "@/lib/dayjs";
import { ApprovalStatusAttendance } from "@/lib/constants";
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
  deleteFlg: string;
};

/**
 * @description
 * 勤務表DB‗登録・更新・削除API
 *
 * @param request NextRequest object
 */
export async function POST(request: NextRequest) {
  try {
    const {
      id,
      targetDate,
      startTime,
      endTime,
      rest,
      workStyle,
      absentCode,
      deleteFlg,
      note,
    } = (await request.json()) as Params;

    if (!id || !targetDate?.length) {
      return NextResponse.json(
        {
          errorCode: "INVALID_PARAMETERS",
          message: "必要なパラメータが不足しています。",
        },
        { status: 400 }
      );
    }

    const employeeId = parseInt(id);
    const targetDateList = targetDate.map((date) => dayjs.utc(date).toDate());
    const currentMonth = dayjs.utc(targetDate[0]).startOf("month");
    const nextMonth = currentMonth.add(1, "month");
    const yearMonth = currentMonth.format("YYYYMM");

    if (deleteFlg === "1") {
      await prisma.$transaction(async (tx) => {
        // 削除処理
        await tx.attendance.deleteMany({
          where: {
            employeeId,
            date: { in: targetDateList },
          },
        });

        // 対象月のレコードが残存しているか確認
        const exists = await tx.attendance.findFirst({
          where: {
            employeeId,
            date: {
              gte: currentMonth.toDate(),
              lt: nextMonth.toDate(),
            },
          },
        });

        // 対象月のレコードが存在しない場合、承認状況を「未承認」に更新
        if (!exists) {
          await tx.approval.update({
            where: {
              employeeId_yearMonth: { employeeId, yearMonth },
            },
            data: {
              statusOfAttendance: ApprovalStatusAttendance.unapproved.code,
            },
          });
        }
      });
    } else {
      // 削除以外（登録、更新）の場合
      const entries = targetDate.map((date) => {
        const entryDate = dayjs.utc(date).toDate();
        const start = startTime ? dayjs.utc(startTime, "HH:mm").toDate() : null;
        const end = endTime ? dayjs.utc(endTime, "HH:mm").toDate() : null;
        const restTime = rest ? parseFloat(rest) : null;

        return prisma.attendance.upsert({
          where: {
            employeeId_date: { employeeId: employeeId, date: entryDate },
          },
          update: {
            startTime: start,
            endTime: end,
            rest: restTime,
            workStyle: workStyle,
            absentCode: absentCode,
            note: note,
          },
          create: {
            employeeId: employeeId,
            date: entryDate,
            startTime: start,
            endTime: end,
            rest: restTime,
            workStyle: workStyle,
            absentCode: absentCode,
            note: note,
          },
        });
      });

      await prisma.$transaction(async (tx) => {
        // 登録/更新処理
        await Promise.all(entries);

        // 承認状況を「入力中」に更新
        await tx.approval.updateMany({
          where: {
            employeeId: employeeId,
            yearMonth: yearMonth,
            statusOfAttendance: {
              // 差戻中の場合は更新しないものとする。
              not: ApprovalStatusAttendance.reinput.code,
            },
          },
          data: {
            statusOfAttendance: ApprovalStatusAttendance.input.code,
          },
        });
      });
    }

    // ============================ 共通処理 ============================
    // メンバーIDに紐づく勤務表データを取得
    const attendanceList = await prisma.attendance.findMany({
      where: {
        AND: [
          {
            employeeId: employeeId,
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
          employeeId: employeeId,
          yearMonth: yearMonth,
        },
      },
      data: {
        totalActive: customAttendance.reduce((sum, row) => {
          return sum + (row.activeTime ?? 0);
        }, 0),
      },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    console.error("error", error);
    return NextResponse.json(
      {
        errorCode: "UNKNOWN_ERROR",
        message: "データの登録・更新・削除中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}
