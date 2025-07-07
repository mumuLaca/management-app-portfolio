import prisma from "@/lib/prismadb";
import { Reimbursement, Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * ルーム削除API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reimbursement[] | Prisma.BatchPayload | null>
) {
  // パラメーター取得
  const { roomId, employeeId } = req.body;

  try {
    // ルーム削除処理
    await prisma.roomInfo.delete({
      where: {
        employeeId_roomId: {
          employeeId: employeeId,
          roomId: roomId,
        },
      },
    });

    // 週報、四半期報カバーの削除処理
    await prisma.coverSection.deleteMany({
      where: {
        roomId: roomId,
      },
    });

    res.status(200).json(null);
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    res.status(400).json(null);
  }
}
