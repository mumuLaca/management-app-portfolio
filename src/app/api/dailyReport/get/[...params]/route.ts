import prisma from "@/lib/prismadb";
import dayjs from "dayjs";

/**
 * @description
 * 日報‗取得API
 *
 * @param request Request data
 * @param params URL parameters
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    // クエリパラメータから必要なデータを取得
    const resolvedParams = await params;
    const [roomId, date, employeeId] = resolvedParams.params;
    // クエリパラメータから取得した日付をUTCに変換し、開始日と終了日を取得
    const startOfDay = dayjs
      .utc(date as string)
      .startOf("day")
      .toDate();
    const endOfDay = dayjs
      .utc(date as string)
      .endOf("day")
      .toDate();

    // 日報の取得処理
    const post = await prisma.dailyReportPost.findFirst({
      where: {
        roomId: roomId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        postSection: {
          include: {
            sectionComment: {
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
        },
      },
    });

    // ログイン中の社員の権限を取得
    const memberInfo = await prisma.roomMember.findUnique({
      where: {
        roomId_employeeId: {
          roomId: roomId,
          employeeId: Number(employeeId),
        },
      },
      select: {
        authority: true,
      },
    });

    const result = {
      ...post,
      authority: memberInfo?.authority ?? "",
    };

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
