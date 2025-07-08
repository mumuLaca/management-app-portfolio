import prisma from "@/lib/prismadb";

/**
 * @description
 * 課題情報取得API
 *
 * @param request Request data
 */
export async function GET(request: Request) {
  // リクエストからのクエリパラメータを取得
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  try {
    // ルームIDを使用して、課題情報を取得
    const issues = await prisma.issue.findMany({
      where: {
        roomId: roomId as string,
      },
      orderBy: [
        {
          issueNo: "desc",
        },
      ],
    });

    return Response.json(issues, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
