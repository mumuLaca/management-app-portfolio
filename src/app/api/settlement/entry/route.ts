import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "@/lib/dayjs";
import {
  ApprovalStatusSettlement,
  EntryFlg,
  TravelMethod,
} from "@/lib/constants";

/**
 * @description
 * 交通費精算DB‗登録・更新・削除API
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  // パラメーター取得
  const requestBody = await request.json();

  // 小計算出(往復の場合は片道金額の2倍)
  const total =
    requestBody.method === TravelMethod.roundTrip.code
      ? requestBody.cost * 2
      : requestBody.cost || 0;

  try {
    switch (requestBody.entryFlg) {
      // 登録
      case EntryFlg.entry:
        // クエリ情報の定義
        await prisma.$transaction(async (prisma) => {
          // 登録される日付数分処理を繰り返す
          for (const date of requestBody.targetDate) {
            // 登録済のデータよりdisplayNoが最新のレコードを取得
            const disp = await prisma.settlement.findMany({
              where: {
                employeeId: requestBody.employeeId,
                date: dayjs.utc(date).toDate(),
              },
              orderBy: { displayNo: "desc" },
              take: 1, // 取得するレコードの上限を1に設定
              select: { displayNo: true },
            });

            // 既存の最新displayNoの特定
            const maxDisplayNo = disp.length > 0 ? disp[0].displayNo : 0;

            // 登録処理
            await prisma.settlement.create({
              data: {
                employeeId: requestBody.employeeId,
                displayNo: maxDisplayNo + 1,
                date: dayjs.utc(date).toDate(),
                form: requestBody.form,
                method: requestBody.method,
                departure: requestBody.departure,
                arrival: requestBody.arrival,
                transportation: requestBody.transportation,
                cost: parseInt(String(requestBody.cost)),
                total: parseInt(String(total)),
                note: requestBody.note,
              },
            });
          }

          // 承認状況を「入力中」に更新
          await prisma.approval.updateMany({
            where: {
              employeeId: requestBody.employeeId,
              yearMonth: dayjs.utc(requestBody.targetDate[0]).format("YYYYMM"),
              statusOfSettlement: {
                // 差戻中の場合は更新しないものとする。
                not: ApprovalStatusSettlement.reinput.code,
              },
            },
            data: {
              statusOfSettlement: ApprovalStatusSettlement.input.code,
            },
          });
        });

        break;

      // 更新
      case EntryFlg.update:
        // クエリ情報の定義
        await prisma.settlement.update({
          where: {
            employeeId_tno: {
              employeeId: requestBody.employeeId,
              tno: requestBody.tno,
            },
            date: dayjs.utc(requestBody.targetDate[0]).toDate(),
          },
          data: {
            displayNo: requestBody.displayNo,
            form: requestBody.form,
            method: requestBody.method,
            departure: requestBody.departure,
            arrival: requestBody.arrival,
            transportation: requestBody.transportation,
            cost: parseInt(String(requestBody.cost)),
            total: parseInt(String(total)),
            note: requestBody.note,
          },
        });

        break;

      // 削除
      case EntryFlg.delete:
        /** 交通費精算DBからデータ削除 */
        await prisma.$transaction(async (prisma) => {
          await prisma.settlement.deleteMany({
            where: {
              employeeId: requestBody.employeeId,
              tno: requestBody.tno,
            },
          });

          /** 表示順の修正 */
          // 削除したレコードと同日のレコードをすべて取得
          const SomeDayItems = await prisma.settlement.findMany({
            where: {
              employeeId: requestBody.employeeId,
              date: dayjs.utc(requestBody.targetDate[0]).toDate(),
            },
            select: {
              employeeId: true,
              tno: true,
              displayNo: true,
            },
          });

          if (SomeDayItems?.length) {
            // displayNoの昇順にソート
            SomeDayItems.sort((a, b) => a.displayNo - b.displayNo);
            // displayNoを1から順に降りなおす
            SomeDayItems.forEach((obj, index) => (obj.displayNo = index + 1));
            // クエリ作成
            const query = SomeDayItems.map((obj) => {
              return prisma.settlement.update({
                where: {
                  employeeId_tno: {
                    employeeId: obj.employeeId,
                    tno: obj.tno,
                  },
                },
                data: {
                  displayNo: obj.displayNo,
                },
              });
            });
            // 並列実行
            await Promise.all(query);
          }

          /** 承認状況の更新 */
          // 当月1日
          const currentMonth = dayjs(
            `${dayjs.utc(requestBody.targetDate[0]).format("YYYYMM")}01`,
            "YYYYMMDD"
          );
          // 次月1日
          const nextMonth = currentMonth.add(1, "month");
          // 当月の交通費精算DBレコードが存在するか取得
          const settlementData = await prisma.settlement.findFirst({
            where: {
              AND: [
                {
                  employeeId: requestBody.employeeId,
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
          if (!settlementData) {
            await prisma.approval.update({
              where: {
                employeeId_yearMonth: {
                  employeeId: requestBody.employeeId,
                  yearMonth: dayjs
                    .utc(requestBody.targetDate[0])
                    .format("YYYYMM"),
                },
              },
              data: {
                statusOfSettlement: ApprovalStatusSettlement.noInput.code,
              },
            });
          }
        });

        break;
    }

    return NextResponse.json({ message: "処理が完了しました" });
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    return NextResponse.json(
      { message: "処理に失敗しました" },
      { status: 400 }
    );
  }
}
