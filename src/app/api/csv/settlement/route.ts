import { SettlementForm, TravelMethod } from "@/lib/constants";
import prisma from "@/lib/prismadb";
import dayjs from "@/lib/dayjs";
import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";
import { stringify } from "csv-stringify/sync";
import { Settlement } from "@prisma/client";
import {
  getSettlementFormKey,
  getTravelMethodKey,
} from "@/utils/constantsUtil";

interface outputSettlement extends Settlement {
  ym?: string;
  commuterTotal?: number;
  tripTotal?: number;
  monthTotal?: number;
  name?: string;
}

// CSVレイアウトヘッダー
const csvHeader = [
  "メンバー番号",
  "氏名",
  "対象年月",
  "日付",
  "区分",
  "移動/宿泊",
  "発駅/宿泊地",
  "着駅",
  "交通機関",
  "片道交通費/宿泊費",
  "小計",
  "通勤費合計",
  "出張費合計",
  "月累計",
  "備考",
];

/**
 * @description
 * 交通費精算CSV出力
 *
 * @param request NextRequest object
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ym = searchParams.get("ym");
    const filterSection = searchParams.get("filterSection") ?? "";
    const approvalStatus = searchParams.get("approvalStatus") ?? "";

    if (!ym) {
      return NextResponse.json(
        { error: "Year month parameter is required" },
        { status: 400 }
      );
    }

    const currentMonth = dayjs.utc(`${ym}01`);
    const nextMonth = currentMonth.add(1, "month");

    let outputCSV: unknown[] = [];

    // 承認済のメンバー情報を取得
    const approvals = await prisma.approval.findMany({
      where: {
        yearMonth: ym,
        ...(approvalStatus !== "" && {
          statusOfSettlement: approvalStatus,
        }),
        ...(filterSection !== "" && {
          employee: {
            section: filterSection,
          },
        }),
      },
      select: {
        employeeId: true,
      },
    });

    // 承認済データが存在する場合
    if (!approvals?.length) {
      outputCSV.push(csvHeader, ["条件に該当するデータはありません。"]);

      // 承認済データが存在しない場合
    } else {
      // 交通費精算データを取得
      const result = await prisma.settlement.findMany({
        where: {
          date: {
            gte: currentMonth.toDate(),
            lt: nextMonth.toDate(),
          },
          employeeId: {
            in: approvals.map((obj) => obj.employeeId),
          },
        },
        include: {
          employee: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ date: "asc" }, { displayNo: "asc" }],
      });

      // 取得データをメンバーごとに整理する
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupData: { [key: number]: any } = {};
      result.forEach((record) => {
        if (!groupData[record.employeeId]) {
          groupData[record.employeeId] = [];
        }
        groupData[record.employeeId].push(record);
      });

      // 集計用のレコードを作成
      const outputData: outputSettlement[] = [];
      Object.keys(groupData).forEach((key) => {
        const group = groupData[Number(key)];
        // 通勤費合計
        const commuterTotal = group.reduce(
          (acc: number, item: Settlement) =>
            item.form === SettlementForm.commuter.code ? acc + item.total : acc,
          0
        );
        // 出張費合計
        const tripTotal = group.reduce(
          (acc: number, item: Settlement) =>
            item.form === SettlementForm.trip.code ? acc + item.total : acc,
          0
        );
        // 月合計を計算
        const monthTotal = group.reduce(
          (acc: number, item: Settlement) => acc + item.total,
          0
        );

        // 集計レコードを各メンバーレコードの先頭に配置
        group.unshift({
          employeeId: Number(key),
          name: group[0].employee.name,
          ym: dayjs(currentMonth).format("YYYY/MM"),
          date: "",
          form: "",
          method: "",
          departure: "",
          arrival: "",
          transportation: "",
          cost: "",
          total: "",
          commuterTotal: commuterTotal, //通勤費合計
          tripTotal: tripTotal, //出張費合計
          monthTotal: monthTotal,
          note: "集計レコード",
          createdAt: "",
          updatedAt: "",
        });
        outputData.push(...group);
      });

      // CSV出力用の配列を作成
      outputCSV = [
        csvHeader,
        ...outputData.map((obj) => [
          obj.employeeId,
          obj.name ?? "",
          obj.ym ?? "",
          obj.date ? dayjs(obj.date).format("YYYY/MM/DD(dd)") : "",
          obj.form ? SettlementForm[getSettlementFormKey(obj.form)].method : "",
          obj.method ? TravelMethod[getTravelMethodKey(obj.method)].method : "",
          obj.departure,
          obj.arrival,
          obj.transportation,
          obj.cost,
          obj.total,
          obj.commuterTotal ?? "",
          obj.tripTotal ?? "",
          obj.monthTotal ?? "",
          obj.note,
        ]),
      ];
    }

    const now = dayjs().format("YYYYMMDD_HHmmss");
    const csvData = iconv.encode(stringify(outputCSV), "Shift_JIS");

    // CSV出力処理
    return new NextResponse(csvData, {
      headers: {
        "Content-Disposition": `attachment; filename=${ym}_${now}_settlement.csv`,
        "Content-Type": "text/csv; charset=Shift_JIS",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
