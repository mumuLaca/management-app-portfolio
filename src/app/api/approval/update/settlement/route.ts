import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

/**
 * @description
 * 承認状況の更新‗交通費精算表
 *
 * @param request Request object
 * @returns NextResponse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, yearMonth, approve } = body;

    if (!id || !yearMonth || !approve) {
      return NextResponse.json(
        { error: "Required parameters are missing" },
        { status: 400 }
      );
    }

    // 承認状況更新
    const result = await prisma.approval.update({
      where: {
        employeeId_yearMonth: {
          employeeId: parseInt(id),
          yearMonth: yearMonth,
        },
      },
      data: {
        statusOfSettlement: approve,
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
