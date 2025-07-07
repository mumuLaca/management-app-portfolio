import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

/**
 * @description
 * 旅費精算登録パターン削除
 * @param request request data
 */
export async function POST(request: NextRequest) {
  // パラメーター取得
  const { employeeId, tno } = await request.json();

  // データ取得
  try {
    const result = await prisma.settlementPattern.delete({
      where: {
        employeeId_tno: {
          employeeId: employeeId,
          tno: tno,
        },
      },
    });

    if (result === null) {
      return NextResponse.json(
        { message: "旅費精算登録パターンの削除に失敗しました" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "旅費精算登録パターンの削除に失敗しました" },
      { status: 400 }
    );
  }
}
