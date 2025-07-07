import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

type RequestBody = {
  id: string;
};

/**
 * @description
 * 入力候補の取得
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "社員IDが指定されていません" },
        { status: 400 }
      );
    }

    // 目的/内容
    const contentsList = await prisma.reimbursement.findMany({
      where: { employeeId: parseInt(id) },
      select: { contents: true },
      distinct: ["contents"],
      orderBy: { createdAt: "desc" }, // 最新順
      take: 6, // 最大6件
    });

    // 支払先
    const paidToList = await prisma.reimbursement.findMany({
      where: { employeeId: parseInt(id) },
      select: { paidTo: true },
      distinct: ["paidTo"],
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // 備考
    const noteList = await prisma.reimbursement.findMany({
      where: { employeeId: parseInt(id) },
      select: { note: true },
      distinct: ["note"],
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // 取得結果を返却
    return NextResponse.json({
      candidateContents: contentsList?.map((item) => item.contents) || [],
      candidatePaidTo: paidToList?.map((item) => item.paidTo) || [],
      candidateNote: noteList?.map((item) => item.note) || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "入力候補の取得に失敗しました" },
      { status: 400 }
    );
  }
}
