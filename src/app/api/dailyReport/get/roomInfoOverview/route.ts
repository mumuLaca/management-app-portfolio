import prisma from "@/lib/prismadb";
import { DailyReportAuthority } from "@/lib/constants";

/**
 * @description
 * 担当用のルーム情報を取得するAPI
 *
 * @param request Request data
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");

  try {
    // 育成担当、本社担当
    const affiliationRooms = await prisma.roomMember.findMany({
      where: {
        employeeId: Number(employeeId),
        OR: [
          { authority: DailyReportAuthority.trainer.code },
          { authority: DailyReportAuthority.officeStaff.code },
        ],
      },
      select: {
        roomId: true,
      },
    });

    // 取得したルームIDを使用して、社員情報を取得
    const result = await prisma.employee.findMany({
      where: {
        roomInfo: {
          some: {
            roomId: {
              in: affiliationRooms.map((room) => room.roomId),
            },
          },
        },
      },
      include: {
        roomInfo: {
          include: {
            roomMember: true,
          },
        },
      },
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
