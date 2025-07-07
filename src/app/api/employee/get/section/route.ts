import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

/**
 * @description
 * 所属情報取得API
 * 全社員の所属先を一覧化し取得
 *
 */
export async function GET() {
  try {
    // 所属情報を一括取得
    const sections = await prisma.employee.findMany({
      select: {
        section: true,
      },
      distinct: ["section"],
      orderBy: [{ section: "asc" }],
    });

    return NextResponse.json(sections, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
