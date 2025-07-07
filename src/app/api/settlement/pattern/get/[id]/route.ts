import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

/**
 * @description
 * 交通費精算登録パターン取得
 * @param request request data
 * @param context route parameters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // データ取得
  try {
    const result = await prisma.settlementPattern.findMany({
      where: {
        employeeId: parseInt(id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (result === null) {
      return NextResponse.json(
        { message: "交通費精算登録パターンの取得に失敗しました" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "交通費精算登録パターンの取得に失敗しました" },
      { status: 400 }
    );
  }
}
