import prisma from "@/lib/prismadb";
import { Reimbursement, Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * 課題削除API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reimbursement[] | Prisma.BatchPayload | null>
) {
  // パラメーター取得
  const { roomId, issueNo } = req.body;

  try {
    // 課題削除処理
    await prisma.issue.delete({
      where: {
        roomId_issueNo: {
          roomId: roomId,
          issueNo: Number(issueNo),
        },
      },
    });

    res.status(200).json(null);
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    res.status(400).json(null);
  }
}
