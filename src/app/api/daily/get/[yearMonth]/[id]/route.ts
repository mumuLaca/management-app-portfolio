import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import dayjs from "@/lib/dayjs";
import {
  calcActiveTime,
  calcLateNightOverTime,
  calcLegalHolidayActiveTime,
  calcOverTime,
} from "@/utils/caluculationTimeUtil";

/**
 * @description
 * 勤務表データ取得API
 *
 * @param request NextRequest object
 * @param context URL parameters containing yearMonth and id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const resolvedParams = await params;
  const { yearMonth, id } = resolvedParams;

  if (!yearMonth || !id) {
    return NextResponse.json(
      {
        errorCode: "INVALID_PARAMETERS",
        message: "必要なパラメータが不足しています。",
      },
      { status: 400 }
    );
  }

  const currentMonth = dayjs(`${yearMonth}01`, "YYYYMMDD");
  const nextMonth = currentMonth.add(1, "month");

  try {
    const approvalData = await prisma.approval.findUnique({
      where: {
        employeeId_yearMonth: {
          employeeId: parseInt(id),
          yearMonth: yearMonth,
        },
      },
      select: {
        statusOfAttendance: true,
      },
    });

    if (!approvalData) {
      return NextResponse.json(
        {
          errorCode: "NO_APPROVAL_RECORD",
          message:
            "対象月の承認レコードが存在しません。作成処理を行います。（HOME画面に遷移します）",
        },
        { status: 400 }
      );
    }

    // メンバーIDに紐づく勤務表データを取得
    const attendanceList = await prisma.attendance.findMany({
      where: {
        AND: [
          {
            employeeId: parseInt(id),
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

    // 取得結果を返却
    return NextResponse.json({
      yearMonth: yearMonth,
      approvalStatus: approvalData?.statusOfAttendance,
      list: [...customAttendance],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        errorCode: "UNKNOWN_ERROR",
        message:
          "データ取得中にエラーが発生しました。更新しても改善されない場合、管理者にお問い合わせください。",
      },
      { status: 500 }
    );
  }
}
