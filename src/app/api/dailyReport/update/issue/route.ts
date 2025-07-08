import prisma from "@/lib/prismadb";
import dayjs from "dayjs";

/**
 * @description
 * 課題登録API
 *
 * @param request Request data
 */
export async function POST(request: Request) {
  try {
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
    } = await request.json();

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

    return new Response(null, { status: 200 });
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    return new Response(null, { status: 400 });
  }
}
