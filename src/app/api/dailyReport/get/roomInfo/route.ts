import prisma from "@/lib/prismadb";

/**
 * @description
 * ルーム情報取得API
 *
 * @param request Request data
 */
export async function GET(request: Request) {
  // リクエストからのクエリパラメータを取得
  const { searchParams } = new URL(request.url);
  const searchName = searchParams.get("searchName");

  try {
    // ルーム情報を取得
    const result = await prisma.roomInfo.findMany({
      where: {
        employee: {
          name: {
            contains: searchName as string,
          },
        },
      },
      include: {
        roomMember: true,
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
    });

    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
