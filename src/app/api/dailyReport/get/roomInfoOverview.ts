import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prismadb";
import { DiaryAuthority } from "@/lib/constants";

/**
 * @description
 * 担当用のルーム情報を取得するAPI
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { employeeId } = req.query;

  try {
    // 育成担当、本社担当
    const affiliationRooms = await prisma.roomMember.findMany({
      where: {
        employeeId: Number(employeeId),
        OR: [
          { authority: DiaryAuthority.trainer.code },
          { authority: DiaryAuthority.officeStaff.code },
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

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
