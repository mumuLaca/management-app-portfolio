import prisma from "@/lib/prismadb";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";

interface Section {
  title: string;
  content: string;
  indexNo: number;
}

/**
 * @description
 * 週報、四半期報カバー登録API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // リクエストボディから必要なデータを取得
  const { postId, roomId, yearMonth, diaryType, sections } = req.body;
  try {
    // 16文字のランダムなIDを生成
    const entryPostId = postId || nanoid(16);

    await prisma.$transaction(async (prisma) => {
      // 各セクションをupsert
      const postSectionPromises = sections.map((section: Section) =>
        prisma.coverSection.upsert({
          where: {
            postId_indexNo: {
              postId: entryPostId,
              indexNo: section.indexNo,
            },
          },
          update: {
            content: section.content,
          },
          create: {
            postId: entryPostId,
            indexNo: section.indexNo,
            title: section.title,
            content: section.content,
            roomId: roomId,
            yearMonth: yearMonth,
            diaryType: diaryType,
          },
        })
      );

      await Promise.all(postSectionPromises);
    });

    res.status(200).json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
}
