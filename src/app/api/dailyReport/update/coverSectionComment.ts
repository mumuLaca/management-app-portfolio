import { CodeCRUD } from "@/lib/constants";
import prisma from "@/lib/prismadb";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * カバーセクションコメント登録・更新・削除API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    postId,
    indexNo,
    employeeId,
    employeeName,
    commentNo,
    content,
    date,
    crud,
  } = req.body;
  let result;

  try {
    // CRUDの値に応じて処理を分岐
    switch (crud) {
      // 登録
      case CodeCRUD.create.code:
        // 登録済のコメントNoの最大値を取得
        const maxCommentNoData = await prisma.coverSectionComment.aggregate({
          _max: {
            commentNo: true,
          },
          where: {
            postId: postId,
            indexNo: Number(indexNo),
          },
        });

        // コメントを登録
        result = await prisma.coverSectionComment.create({
          data: {
            postId: postId,
            indexNo: Number(indexNo),
            employeeId: employeeId,
            employeeName: employeeName,
            commentNo: maxCommentNoData._max.commentNo
              ? maxCommentNoData._max.commentNo + 1
              : 1,
            content: content,
            date: dayjs.utc(date).toDate(),
          },
        });
        break;

      // 更新
      case CodeCRUD.update.code:
        result = await prisma.coverSectionComment.update({
          where: {
            postId_indexNo_commentNo: {
              postId: postId,
              indexNo: Number(indexNo),
              commentNo: Number(commentNo),
            },
          },
          data: {
            content: content,
          },
        });
        break;

      // 削除
      case CodeCRUD.delete.code:
        result = await prisma.coverSectionComment.delete({
          where: {
            postId_indexNo_commentNo: {
              postId: postId,
              indexNo: Number(indexNo),
              commentNo: Number(commentNo),
            },
          },
        });
        break;
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
}
