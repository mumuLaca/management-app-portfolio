import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description
 * 社員情報削除API
 *
 * @param request request data
 * @param context URL parameters
 */
export async function DELETE(
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
    // 社員情報の削除
    const result = await prisma.employee.delete({
      where: {
        id: parseInt(id),
      },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { errorCode: "SERVER_ERROR", message: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
