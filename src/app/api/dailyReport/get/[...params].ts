import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prismadb";
import dayjs from "dayjs";

/**
 * @description
 * 日報‗取得API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // クエリパラメータから必要なデータを取得
    const [roomId, date, employeeId] = <string[]>req.query.params;
    // クエリパラメータから取得した日付をUTCに変換し、開始日と終了日を取得
    const startOfDay = dayjs
      .utc(date as string)
      .startOf("day")
      .toDate();
    const endOfDay = dayjs
      .utc(date as string)
      .endOf("day")
      .toDate();

    // 日報の取得処理
    const post = await prisma.diaryPost.findFirst({
      where: {
        roomId: roomId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        postSection: {
          include: {
            sectionComment: {
              orderBy: [
                {
                  commentNo: "desc",
                },
              ],
            },
          },
          orderBy: [
            {
              indexNo: "asc",
            },
          ],
        },
      },
    });

    // ログイン中の社員の権限を取得
    const memberInfo = await prisma.roomMember.findUnique({
      where: {
        roomId_employeeId: {
          roomId: roomId,
          employeeId: Number(employeeId),
        },
      },
      select: {
        authority: true,
      },
    });

    const result = {
      ...post,
      authority: memberInfo?.authority ?? "",
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
