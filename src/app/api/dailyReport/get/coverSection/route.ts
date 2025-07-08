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
  const roomId = searchParams.get("roomId");
  const dailyReportType = searchParams.get("dailyReportType");
  const yearMonth = searchParams.get("yearMonth");

  let result = null;

  try {
    // セクション情報を取得
    const coverSection = await prisma.coverSection.findMany({
      where: {
        roomId: roomId as string,
        dailyReportType: dailyReportType as string,
        yearMonth: yearMonth as string,
      },
      include: {
        coverSectionComment: {
          orderBy: [
            {
              commentNo: "desc",
            },
          ],
        },
      },
      orderBy: [
        {
          indexNo: "asc",
        },
      ],
    });

    if (coverSection.length > 0) {
      result = {
        postId: coverSection[0].postId,
        roomId: coverSection[0].roomId,
        yearMonth: coverSection[0].yearMonth,
        dailyReportType: coverSection[0].dailyReportType,
        section: coverSection.map((section) => {
          return {
            indexNo: section.indexNo,
            title: section.title,
            content: section.content,
            sectionComment: section.coverSectionComment,
          };
        }),
      };
    }

    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
