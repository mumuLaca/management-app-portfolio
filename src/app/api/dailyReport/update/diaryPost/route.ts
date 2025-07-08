import prisma from "@/lib/prismadb";
import dayjs from "dayjs";
import { nanoid } from "nanoid";

interface Section {
  title: string;
  content: string;
  indexNo: number;
}

/**
 * @description
 * 日報‗登録API
 *
 * @param request Request data
 */
export async function POST(request: Request) {
  try {
    // リクエストボディから必要なデータを取得
    const { sections, postId, roomId, date, status } = await request.json();

    // 16文字のランダムなIDを生成
    const newPostId = nanoid(16);

    await prisma.$transaction(async (prisma) => {
      // 日報の登録または更新処理
      // postIdが存在する場合は更新、存在しない場合は新規作成
      await prisma.dailyReportPost.upsert({
        where: {
          postId: postId ?? "",
          date: {
            gte: dayjs.utc(date).startOf("day").toDate(),
            lte: dayjs.utc(date).endOf("day").toDate(),
          },
        },
        update: {
          status: status,
        },
        create: {
          postId: newPostId,
          roomId: roomId,
          date: dayjs.utc(date).toDate(),
          status: status,
        },
        select: {
          postId: true,
        },
      });

      // セクション情報を取得
      const existingSections = await prisma.postSection.findMany({
        where: {
          postId: postId,
        },
        select: {
          indexNo: true,
        },
      });

      if ((existingSections ?? []).length > 0) {
        // ローカルのセクション情報からindexNoを抽出
        const sectionIndexNos = sections.map(
          (section: Section) => section.indexNo
        );

        // ローカルで削除されたindexNoをDBから抽出
        const toDelete = existingSections.filter(
          (existing) => !sectionIndexNos.includes(existing.indexNo)
        );

        // 削除処理
        await prisma.postSection.deleteMany({
          where: {
            postId: postId,
            indexNo: {
              in: toDelete.map((item) => item.indexNo),
            },
          },
        });
      }

      // 各セクションをupsert
      const postSectionPromises = sections.map((section: Section) =>
        prisma.postSection.upsert({
          where: {
            postId_indexNo: {
              postId: postId ?? "",
              indexNo: section.indexNo,
            },
          },
          update: {
            title: section.title,
            content: section.content,
          },
          create: {
            postId: postId || newPostId,
            indexNo: section.indexNo,
            title: section.title,
            content: section.content,
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
