import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import {
  ApprovalStatusDailyReport,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
} from "@/lib/constants";

export type TypeAPIResponse = {
  id: number;
  email: string;
  name: string;
  section: string;
  admin: string;
  yearMonth: string;
  totalActive: number;
  statusOfDailyReport: string;
  statusOfSettlement: string;
  statusOfReimbursement: string;
};

/**
 * @description
 * レポート種類別の提出状況を取得
 *
 * @param request Request object
 * @param context Route context containing dynamic parameters
 * @returns NextResponse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const resolvedParams = await params;
  const { yearMonth, filterSection } = resolvedParams;
  if (!yearMonth) {
    return NextResponse.json(
      { error: "yearMonth is required" },
      { status: 400 }
    );
  }

  try {
    // 承認状況取得
    const result = await prisma.employee.findMany({
      // 所属が空でない場合は条件として追加
      ...(filterSection !== "none" && {
        where: {
          section: filterSection,
        },
      }),
      select: {
        id: true,
        email: true,
        name: true,
        section: true,
        admin: true,
        approval: {
          where: {
            yearMonth: yearMonth,
          },
          take: 1,
          orderBy: {
            employeeId: "asc",
          },
          select: {
            totalActive: true,
            statusOfDailyReport: true,
            statusOfSettlement: true,
            statusOfReimbursement: true,
          },
        },
      },
    });

    // approvalが配列のままで、最初の1件のみを返す
    const formattedResult = result.map((employee) => ({
      ...employee,
      // 対象年月
      yearMonth: yearMonth,
      // 稼働時間
      totalActive: employee.approval?.length
        ? employee.approval[0].totalActive
        : 0,
      // 承認状況（勤務表）
      statusOfDailyReport: employee.approval?.length
        ? employee.approval[0].statusOfDailyReport
        : ApprovalStatusDailyReport.unapproved.code,
      // 承認状況（旅費精算表）
      statusOfSettlement: employee.approval?.length
        ? employee.approval[0].statusOfSettlement
        : ApprovalStatusSettlement.noInput.code,
      // 承認状況（立替精算表）
      statusOfReimbursement: employee.approval?.length
        ? employee.approval[0].statusOfReimbursement
        : ApprovalStatusReimbursement.noInput.code,
    }));

    return NextResponse.json(formattedResult, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
