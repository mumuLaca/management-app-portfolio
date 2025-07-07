import prisma from "@/lib/prismadb";
import { Reimbursement } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";
import { Prisma } from "@prisma/client";

/**
 * @description
 * 課題登録API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reimbursement[] | Prisma.BatchPayload | null>
) {
  // パラメーター取得
  const {
    roomId,
    issueNo,
    date,
    category,
    content,
    status,
    startDate,
    completeDate,
  } = req.body;

  try {
    // 課題登録
    // 既存の課題がある場合は更新、ない場合は新規作成
    await prisma.issue.upsert({
      where: {
        roomId_issueNo: {
          roomId: roomId,
          issueNo: Number(issueNo),
        },
      },
      update: {
        date: dayjs(date).toDate(),
        category: category,
        content: content,
        status: status,
        startDate: startDate ? dayjs(startDate).toDate() : null,
        completeDate: completeDate ? dayjs(completeDate).toDate() : null,
      },
      create: {
        roomId: roomId,
        issueNo: Number(issueNo),
        date: dayjs(date).toDate(),
        category: category,
        content: content,
        status: status,
        startDate: startDate ? dayjs(startDate).toDate() : null,
        completeDate: completeDate ? dayjs(completeDate).toDate() : null,
      },
    });

    res.status(200).json(null);
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    res.status(400).json(null);
  }
}
