import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

/**
 * @description
 * メンバー情報一括取得API
 * 全てのメンバー情報を取得
 *
 */
export async function GET() {
  try {
    // メンバー情報を一括取得
    const employeeAll = await prisma.employee.findMany({
      orderBy: [{ updatedAt: "desc" }],
    });

    return NextResponse.json(employeeAll, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
