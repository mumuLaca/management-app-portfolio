import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prismadb";

/**
 * @description
 * 課題情報取得API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // リクエストからのクエリパラメータを取得
  const { roomId } = req.query;

  try {
    // ルームIDを使用して、課題情報を取得
    const issues = await prisma.issue.findMany({
      where: {
        roomId: roomId as string,
      },
      orderBy: [
        {
          issueNo: "desc",
        },
      ],
    });

    return res.status(200).json(issues);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
