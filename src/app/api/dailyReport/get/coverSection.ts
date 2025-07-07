import prisma from "@/lib/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * ルーム情報取得API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // リクエストからのクエリパラメータを取得
  const { roomId, diaryType, yearMonth } = req.query;

  let result = null;

  try {
    // セクション情報を取得
    const coverSection = await prisma.coverSection.findMany({
      where: {
        roomId: roomId as string,
        diaryType: diaryType as string,
        yearMonth: yearMonth as string,
      },
      include: {
        coverSectionComment: {
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
    });

    if (coverSection.length > 0) {
      result = {
        postId: coverSection[0].postId,
        roomId: coverSection[0].roomId,
        yearMonth: coverSection[0].yearMonth,
        diaryType: coverSection[0].diaryType,
        section: coverSection.map((section) => {
          return {
            indexNo: section.indexNo,
            title: section.title,
            content: section.content,
            sectionComment: section.coverSectionComment,
          };
        }),
      };
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
}
