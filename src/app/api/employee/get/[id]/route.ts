import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description
 * 社員情報取得API
 * IDに紐づく社員情報を取得する
 *
 * @param request request data
 * @param context URL parameters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json(
      {
        errorCode: "INVALID_PARAMETERS",
        message: "必要なパラメータが不足しています。",
      },
      { status: 400 }
    );
  }

  try {
    // 社員情報を取得
    const result = await prisma.employee.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!result) {
      return NextResponse.json(
        { message: "社員情報が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
