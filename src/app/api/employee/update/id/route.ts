import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

type RequestBody = {
  params: {
    id: string;
    section?: string;
    startTime?: string;
    endTime?: string;
    basicWorkStyle?: string;
  };
};

/**
 * @description
 * 社員情報更新API
 * IDに紐づく社員情報を更新する
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { id, section, startTime, endTime, basicWorkStyle } = body.params;

    if (!id) {
      return NextResponse.json(
        { message: "社員IDが指定されていません" },
        { status: 400 }
      );
    }

    // 更新データの構築
    const updateData: Record<string, string> = {};
    if (section) updateData.section = section;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (basicWorkStyle) updateData.basicWorkStyle = basicWorkStyle;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "更新するデータが指定されていません" },
        { status: 400 }
      );
    }

    // 社員情報を更新
    const result = await prisma.employee.update({
      where: {
        id: Number(id),
      },
      data: updateData,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
