import prisma from "@/lib/prismadb";
import dayjs from "dayjs";
import { DailyReportType } from "@/lib/constants";

/**
 * @description
 * カレンダー情報取得API
 *
 * @param request Request data
 */
export async function GET(request: Request) {
  // リクエストクエリから必要なデータを取得
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const date = searchParams.get("date");
  const dailyReportType = searchParams.get("dailyReportType");

  // クエリパラメータから取得した日付をUTCに変換し、月の初日と次の月の初日を取得
  const currentMonth = dayjs.utc(date as string).startOf("month");
  const nextMonth = currentMonth.add(1, "month");

  let gteDate = new Date();
  let ltDate = new Date();

  // dailyReportTypeに応じて取得する日付の範囲を設定
  switch (dailyReportType) {
    case DailyReportType.daily.code:
    case DailyReportType.weekly.code:
      gteDate = currentMonth.toDate();
      ltDate = nextMonth.toDate();
      break;
    case DailyReportType.monthly.code:
    case DailyReportType.quarter.code:
      let targetYear = currentMonth.year();
      if (currentMonth.month() < 3) {
        targetYear = currentMonth.year() - 1;
      }

      gteDate = new Date(targetYear, 3, 1);
      ltDate = new Date(targetYear + 1, 2, 1);
      break;
  }

  try {
    // 日報の取得処理
    // roomIdと日付範囲に基づいて、該当する日報を取得
    const result = await prisma.dailyReportPost.findMany({
      where: {
        AND: [
          {
            roomId: String(roomId),
          },
          {
            date: {
              gte: gteDate,
              lt: ltDate,
            },
          },
        ],
      },
      select: {
        date: true,
        status: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
