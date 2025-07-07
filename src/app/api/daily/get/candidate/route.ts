import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

/**
 * @description
 * 入力候補の取得
 *
 * @param request NextRequest object
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          errorCode: "INVALID_PARAMETERS",
          message: "社員IDが指定されていません。",
        },
        { status: 400 }
      );
    }

    // 備考
    const noteList = await prisma.dailyReport.findMany({
      where: { employeeId: parseInt(id) },
      select: { note: true },
      distinct: ["note"],
      orderBy: { createdAt: "desc" }, // 最新順
      take: 6, // 最大6件
    });

    // 取得結果を返却
    return NextResponse.json({
      candidateNote: noteList?.map((item) => item.note) || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        errorCode: "UNKNOWN_ERROR",
        message: "データ取得中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}
