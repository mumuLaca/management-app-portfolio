import prisma from "@/lib/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * 日報‗承認ステータス更新API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // リクエストボディからパラメーターを取得
  const { postId, approvalStatus } = req.body;

  try {
    // 承認ステータスを更新
    await prisma.diaryPost.update({
      where: {
        postId: postId,
      },
      data: {
        status: approvalStatus,
      },
    });

    res.status(200).json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
}
