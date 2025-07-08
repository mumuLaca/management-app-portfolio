import prisma from "@/lib/prismadb";

/**
 * @description
 * ルームメンバー情報取得API
 *
 * @param request Request data
 */
export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();

    // ルームIDを使用して、ルームメンバー情報を取得
    const roomMembers = await prisma.roomMember.findMany({
      where: {
        roomId: roomId,
      },
      select: {
        employeeId: true,
        employeeName: true,
        authority: true,
      },
    });

    return Response.json(roomMembers, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
