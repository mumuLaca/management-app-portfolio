import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import dayjs from "@/lib/dayjs";
import {
  ApprovalStatusAttendance,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
} from "@/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @description
 * 直近2カ月の承認状況を取得するAPI
 * 承認状況が存在しない場合は、承認レコードを作成する
 *
 * @returns NextResponse
 */
export async function POST() {
  console.log("aaaa");
  try {
    // セッション情報取得
    const session = await getServerSession(authOptions);

    // セッションが存在しない場合のエラーハンドリング
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const id = session.employee.id;

    if (!id) {
      return NextResponse.json(
        { error: "employeeId not found" },
        { status: 400 }
      );
    }

    const currentMonthYm: string = dayjs().format("YYYYMM");
    const prevMonthYm: string = dayjs().subtract(1, "month").format("YYYYMM");

    /** 承認状況取得 */
    const approval = await prisma.approval.findMany({
      where: {
        employeeId: id,
        yearMonth: {
          in: [currentMonthYm, prevMonthYm],
        },
      },
      orderBy: {
        yearMonth: "desc",
      },
    });

    // 当月、前月分のデータの存在有無を確認
    const missingMonths = [currentMonthYm, prevMonthYm].filter(
      (month) => !approval?.find((obj) => obj.yearMonth === month)
    );

    // 承認レコードが作成されている場合は処理を終了
    if ((missingMonths?.length ?? 0) === 0) {
      return NextResponse.json(approval, { status: 200 });
    }

    // 作成されていない月の承認レコードを作成
    const createdApprovals = await Promise.all(
      missingMonths.map((yearMonth) =>
        createApprovalRecord(yearMonth, id.toString())
      )
    );

    // 作成した承認レコードを追加
    approval.push(...createdApprovals);

    return NextResponse.json(approval, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

/**
 * @description
 * 承認レコードを作成する関数
 */
const createApprovalRecord = async (
  yearMonth: string,
  id: string | string[]
) => {
  const approvalData = {
    employeeId: Number(id),
    yearMonth: yearMonth,
    statusOfAttendance: ApprovalStatusAttendance.unapproved.code,
    statusOfSettlement: ApprovalStatusSettlement.noInput.code,
    statusOfReimbursement: ApprovalStatusReimbursement.noInput.code,
  };

  // DB登録（合わせて登録したデータを取得）
  return prisma.approval.create({
    data: approvalData,
    select: {
      employeeId: true,
      yearMonth: true,
      totalActive: true,
      statusOfAttendance: true,
      statusOfSettlement: true,
      statusOfReimbursement: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
