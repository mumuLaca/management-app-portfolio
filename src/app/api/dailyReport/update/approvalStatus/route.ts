import prisma from "@/lib/prismadb";

/**
 * @description
 * 日報‗承認ステータス更新API
 *
 * @param request Request data
 */
export async function POST(request: Request) {
  try {
    // リクエストボディからパラメーターを取得
    const { postId, approvalStatus } = await request.json();

    // 承認ステータスを更新
    await prisma.dailyReportPost.update({
      where: {
        postId: postId,
      },
      data: {
        status: approvalStatus,
      },
    });

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
