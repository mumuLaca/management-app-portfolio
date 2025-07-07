import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "@/lib/dayjs";
import { ApprovalStatusReimbursement, EntryFlg } from "@/lib/constants";

/**
 * @description
 * 立替精算DB‗登録・更新・削除API
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const {
      employeeId,
      tno,
      targetDate,
      contents,
      paidTo,
      cost,
      note,
      entryFlg,
      invoiceFlg,
    } = await request.json();

    // 変更区分による処理分岐
    switch (entryFlg) {
      // 登録
      case EntryFlg.entry:
        // 新規登録用の配列を作成
        const entryData = targetDate.map((date: string) => ({
          date: dayjs.utc(date).toDate(),
          employeeId: employeeId,
          yearMonth: dayjs().format("YYYYMM"),
          contents: contents,
          invoiceFlg: invoiceFlg,
          paidTo: paidTo,
          cost: parseInt(String(cost)),
          note: note,
          isNew: true, // 新規データ識別用フラグ
        }));

        // クエリ情報の定義
        await prisma.$transaction(async (prisma) => {
          // 当月の登録済データを取得
          const existingData = await prisma.reimbursement.findMany({
            where: {
              employeeId: employeeId,
              yearMonth: dayjs().format("YYYYMM"),
            },
            orderBy: [{ date: "asc" }, { createdAt: "asc" }],
          });

          const sortData = [...entryData, ...existingData].sort((a, b) => {
            if (dayjs(a.date).isSame(dayjs(b.date))) {
              // 同じ日付の場合は createdAt 昇順
              return a.createdAt && b.createdAt
                ? a.createdAt.getTime() - b.createdAt.getTime()
                : -1;
            }
            // date 昇順
            return a.date.getTime() - b.date.getTime();
          });

          const upsertData = sortData.map((reimbursement, index) => {
            return prisma.reimbursement.upsert({
              where: {
                employeeId_tno: {
                  employeeId: reimbursement.employeeId,
                  tno: reimbursement.tno || 0,
                },
                yearMonth: reimbursement.yearMonth,
              },
              update: {
                displayNo: Number(index + 1),
              },
              create: {
                employeeId: reimbursement.employeeId,
                yearMonth: dayjs.utc(reimbursement.date).format("YYYYMM"),
                displayNo: Number(index + 1),
                date: dayjs.utc(reimbursement.date).toDate(),
                contents: reimbursement.contents,
                invoiceFlg: Boolean(reimbursement.invoiceFlg),
                paidTo: reimbursement.paidTo,
                cost: parseInt(String(reimbursement.cost)),
                note: reimbursement.note,
              },
            });
          });

          // 一括登録
          await Promise.all(upsertData);

          // 承認状況を「入力中」に更新
          await prisma.approval.updateMany({
            where: {
              employeeId: employeeId,
              yearMonth: dayjs.utc(targetDate[0]).format("YYYYMM"),
              statusOfReimbursement: {
                // 差戻中の場合は更新しないものとする。
                not: ApprovalStatusReimbursement.reinput.code,
              },
            },
            data: {
              statusOfReimbursement: ApprovalStatusReimbursement.input.code,
            },
          });
        });

        break;

      // 更新
      case EntryFlg.update:
        // クエリ情報の定義
        await prisma.reimbursement.update({
          where: {
            employeeId_tno: {
              employeeId: employeeId,
              tno: tno,
            },
            tno: tno,
            date: dayjs.utc(targetDate[0]).toDate(),
          },
          data: {
            contents: contents,
            invoiceFlg: Boolean(invoiceFlg),
            paidTo: paidTo,
            cost: parseInt(String(cost)),
            note: note,
          },
        });

        break;

      // 削除
      case EntryFlg.delete:
        /** 旅費精算DBからデータ削除 */
        await prisma.$transaction(async (prisma) => {
          await prisma.reimbursement.delete({
            where: {
              employeeId_tno: {
                employeeId: employeeId,
                tno: tno,
              },
              tno: tno,
            },
          });

          /** 承認状況の更新 */
          // 当月1日
          const currentMonth = dayjs(
            `${dayjs.utc(targetDate[0]).format("YYYYMM")}01`,
            "YYYYMMDD"
          );
          // 次月1日
          const nextMonth = currentMonth.add(1, "month");
          // 当月の旅費精算DBレコードが存在するか取得
          const reimbursementData = await prisma.reimbursement.findFirst({
            where: {
              AND: [
                {
                  employeeId: employeeId,
                },
                {
                  date: {
                    gte: currentMonth.toDate(),
                    lt: nextMonth.toDate(),
                  },
                },
              ],
            },
          });

          // 当月のレコードが存在しない場合、承認状況を「申請なし」に変更
          if (!reimbursementData) {
            await prisma.approval.update({
              where: {
                employeeId_yearMonth: {
                  employeeId: employeeId,
                  yearMonth: dayjs.utc(targetDate[0]).format("YYYYMM"),
                },
              },
              data: {
                statusOfReimbursement: ApprovalStatusReimbursement.noInput.code,
              },
            });
          }
        });

        break;
    }

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    return NextResponse.json(
      { message: "立替精算データの処理に失敗しました" },
      { status: 400 }
    );
  }
}
