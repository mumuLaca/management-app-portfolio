import prisma from "@/lib/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * ルーム情報取得API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // リクエストからのクエリパラメータを取得
  const { searchName } = req.query;

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

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
}
