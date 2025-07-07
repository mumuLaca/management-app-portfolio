import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import dayjs from "@/lib/dayjs";
import {
  ApprovalStatusAttendance,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
} from "@/lib/constants";

/**
 * @description
 * 立替精算データ取得
 *
 * @param request request data
 * @param context URL parameters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const resolvedParams = await params;
  const { yearMonth, id } = resolvedParams;

  if (!yearMonth || !id) {
    return NextResponse.json(
      {
        errorCode: "INVALID_PARAMETERS",
        message: "必要なパラメータが不足しています。",
      },
      { status: 400 }
    );
  }

  const currentMonth = dayjs(`${yearMonth}01`, "YYYYMMDD");
  const nextMonth = currentMonth.add(1, "month");

  try {
    // 立替精算DB取得
    const reimbursementData = await prisma.reimbursement.findMany({
      where: {
        AND: [
          {
            employeeId: parseInt(id),
          },
          {
            date: {
              gte: currentMonth.toDate(),
              lt: nextMonth.toDate(),
            },
          },
        ],
      },
      orderBy: [{ date: "asc" }, { tno: "asc" }],
    });

    // 立替精算データが存在しない場合
    if (!reimbursementData?.length) {
      // 月跨ぎでmain画面を経由せずに遷移した場合に備えて、
      // approvalレコードが存在しない場合は作成する。
      const approvalRef = await prisma.approval.upsert({
        where: {
          employeeId_yearMonth: {
            employeeId: parseInt(id),
            yearMonth: yearMonth,
          },
        },
        update: {},
        create: {
          employeeId: parseInt(id),
          yearMonth: yearMonth,
          statusOfAttendance: ApprovalStatusAttendance.unapproved.code,
          statusOfSettlement: ApprovalStatusSettlement.noInput.code,
          statusOfReimbursement: ApprovalStatusReimbursement.noInput.code,
        },
        select: {
          yearMonth: true,
          statusOfReimbursement: true,
        },
      });

      // 取得結果を返却
      return NextResponse.json({
        yearMonth: approvalRef.yearMonth,
        approvalStatus: approvalRef.statusOfReimbursement,
        list: [],
      });
    }

    // 承認状況DB取得
    const approvalData = await prisma.approval.findFirst({
      where: {
        AND: {
          employeeId: parseInt(id),
          yearMonth: yearMonth,
        },
      },
      select: {
        yearMonth: true,
        statusOfReimbursement: true,
      },
    });

    // 取得結果を返却
    return NextResponse.json({
      yearMonth: approvalData?.yearMonth,
      approvalStatus: approvalData?.statusOfReimbursement,
      list: [...reimbursementData],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        errorCode: "UNKNOWN_ERROR",
        message:
          "データ取得中にエラーが発生しました。更新しても改善されない場合、管理者にお問い合わせください。",
      },
      { status: 500 }
    );
  }
}
