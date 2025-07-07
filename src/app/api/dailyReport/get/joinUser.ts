import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prismadb";

/**
 * @description
 * ルームメンバー情報取得API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // リクエストボディからパラメーターを取得
  const { roomId } = req.body;

  try {
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

    return res.status(200).json(roomMembers);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
