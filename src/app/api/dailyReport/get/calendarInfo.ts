import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prismadb";
import dayjs from "dayjs";
import { DiaryType } from "@/lib/constants";

/**
 * @description
 * カレンダー情報取得API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // リクエストクエリから必要なデータを取得
  const { roomId, date, diaryType } = req.query;

  // クエリパラメータから取得した日付をUTCに変換し、月の初日と次の月の初日を取得
  const currentMonth = dayjs.utc(date as string).startOf("month");
  const nextMonth = currentMonth.add(1, "month");

  let gteDate = new Date();
  let ltDate = new Date();

  // diaryTypeに応じて取得する日付の範囲を設定
  switch (diaryType) {
    case DiaryType.daily.code:
    case DiaryType.weekly.code:
      gteDate = currentMonth.toDate();
      ltDate = nextMonth.toDate();
      break;
    case DiaryType.monthly.code:
    case DiaryType.quarter.code:
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
    const result = await prisma.diaryPost.findMany({
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

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
