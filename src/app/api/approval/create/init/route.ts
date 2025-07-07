import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import {
  ApprovalStatusDailyReport,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
} from "@/lib/constants";

/**
 * @description
 * 当月の承認レコードを新規作成するAPI
 *
 * @param request Request object
 * @returns NextResponse
 */
export async function GET(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const yearMonth = searchParams.get("yearMonth");

    if (!id || !yearMonth) {
      return NextResponse.json(
        { error: "Required parameters are missing" },
        { status: 400 }
      );
    }

    // 当月の承認状況を取得
    const approval = await prisma.approval.findUnique({
      where: {
        employeeId_yearMonth: {
          employeeId: parseInt(id),
          yearMonth: yearMonth,
        },
      },
    });

    // 承認レコードが存在しない場合は新規作成
    if (!approval) {
      await prisma.approval.create({
        data: {
          employeeId: parseInt(id),
          yearMonth: yearMonth,
          statusOfDailyReport: ApprovalStatusDailyReport.unapproved.code,
          statusOfSettlement: ApprovalStatusSettlement.noInput.code,
          statusOfReimbursement: ApprovalStatusReimbursement.noInput.code,
        },
      });
    }

    // 成功レスポンスを返却
    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
