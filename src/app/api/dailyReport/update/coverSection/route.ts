import prisma from "@/lib/prismadb";
import { nanoid } from "nanoid";

interface Section {
  title: string;
  content: string;
  indexNo: number;
}

/**
 * @description
 * 週報、四半期報カバー登録API
 *
 * @param request Request data
 */
export async function POST(request: Request) {
  try {
    // リクエストボディから必要なデータを取得
    const { postId, roomId, yearMonth, dailyReportType, sections } =
      await request.json();

    // 16文字のランダムなIDを生成
    const entryPostId = postId || nanoid(16);

    await prisma.$transaction(async (prisma) => {
      // 各セクションをupsert
      const postSectionPromises = sections.map((section: Section) =>
        prisma.coverSection.upsert({
          where: {
            postId_indexNo: {
              postId: entryPostId,
              indexNo: section.indexNo,
            },
          },
          update: {
            content: section.content,
          },
          create: {
            postId: entryPostId,
            indexNo: section.indexNo,
            title: section.title,
            content: section.content,
            roomId: roomId,
            yearMonth: yearMonth,
            dailyReportType: dailyReportType,
          },
        })
      );

      await Promise.all(postSectionPromises);
    });

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
