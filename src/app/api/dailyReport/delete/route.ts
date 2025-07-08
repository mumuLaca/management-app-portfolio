import prisma from "@/lib/prismadb";

/**
 * @description
 * ルーム削除・課題削除API
 *
 * @param request Request data
 */
export async function DELETE(request: Request) {
  try {
    const { roomId, employeeId, issueNo, type } = await request.json();

    if (type === "roomInfo") {
      // ルーム削除処理
      await prisma.roomInfo.delete({
        where: {
          employeeId_roomId: {
            employeeId: employeeId,
            roomId: roomId,
          },
        },
      });

      // 週報、四半期報カバーの削除処理
      await prisma.coverSection.deleteMany({
        where: {
          roomId: roomId,
        },
      });
    } else if (type === "issue") {
      // 課題削除処理
      await prisma.issue.delete({
        where: {
          roomId_issueNo: {
            roomId: roomId,
            issueNo: Number(issueNo),
          },
        },
      });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 400 });
  }
}
