import { CodeCRUD } from "@/lib/constants";
import prisma from "@/lib/prismadb";
import dayjs from "dayjs";

/**
 * @description
 * セクションコメント登録・更新・削除API
 *
 * @param request Request data
 */
export async function POST(request: Request) {
  try {
    const {
      postId,
      indexNo,
      employeeId,
      employeeName,
      commentNo,
      content,
      date,
      crud,
    } = await request.json();
    let result;

    // CRUDの値に応じて処理を分岐
    switch (crud) {
      // 登録
      case CodeCRUD.create.code:
        // 登録済のコメントNoの最大値を取得
        const maxCommentNoData = await prisma.sectionComment.aggregate({
          _max: {
            commentNo: true,
          },
          where: {
            postId: postId,
            indexNo: Number(indexNo),
          },
        });

        // コメントを登録
        result = await prisma.sectionComment.create({
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
        result = await prisma.sectionComment.update({
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
        result = await prisma.sectionComment.delete({
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

    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
