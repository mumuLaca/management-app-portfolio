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
 * 交通費精算データ取得
 *
 * @param request request data
 * @param context route parameters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const resolvedParams = await params;
  const { yearMonth, id } = resolvedParams;

  const currentMonth = dayjs(`${yearMonth}01`, "YYYYMMDD");
  const nextMonth = currentMonth.add(1, "month");

  try {
    //  交通費精算DB取得
    const settlementData = await prisma.settlement.findMany({
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
      orderBy: [{ date: "asc" }, { displayNo: "asc" }],
    });

    // 交通費精算データが存在しない場合
    if (!settlementData?.length) {
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
          statusOfSettlement: true,
        },
      });

      // 取得結果を返却
      return NextResponse.json({
        yearMonth: approvalRef.yearMonth,
        approvalStatus: approvalRef.statusOfSettlement,
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
        statusOfSettlement: true,
      },
    });

    // 取得結果を返却
    return NextResponse.json({
      yearMonth: approvalData?.yearMonth,
      approvalStatus: approvalData?.statusOfSettlement,
      list: [...settlementData],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "交通費精算データの取得に失敗しました" },
      { status: 400 }
    );
  }
}
