import prisma from "@/lib/prismadb";
import dayjs from "@/lib/dayjs";
import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";
import { stringify } from "csv-stringify/sync";
import { Reimbursement } from "@prisma/client";

interface outputReimbursement extends Reimbursement {
  ym?: string;
  monthTotal?: number;
  name?: string;
  monthTotalFlg?: boolean;
}

// CSVレイアウトヘッダー
const csvHeader = [
  "社員番号",
  "氏名",
  "#",
  "対象年月",
  "日付",
  "内容",
  "支払先",
  "小計",
  "月累計",
  "インボイス登録番号",
  "備考",
];

/**
 * @description
 * 立替精算CSV出力
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

    // 承認済の社員情報を取得
    const approvals = await prisma.approval.findMany({
      where: {
        yearMonth: ym,
        ...(approvalStatus !== "" && {
          statusOfReimbursement: approvalStatus,
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
      // 立替精算データを取得
      const result = await prisma.reimbursement.findMany({
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
        orderBy: [{ date: "asc" }, { tno: "asc" }],
      });

      // 取得データを社員ごとに整理する
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupData: { [key: number]: any } = {};
      result.forEach((record) => {
        if (!groupData[record.employeeId]) {
          groupData[record.employeeId] = [];
        }
        groupData[record.employeeId].push(record);
      });

      // 集計用のレコードを作成
      const outputData: outputReimbursement[] = [];
      Object.keys(groupData).forEach((key) => {
        const group = groupData[Number(key)];
        const monthTotal = group.reduce(
          (acc: number, item: Reimbursement) => acc + item.cost,
          0
        );

        // 集計レコードを各社員レコードの先頭に配置
        group.unshift({
          employeeId: Number(key),
          name: group[0].employee.name,
          displayNo: "",
          ym: dayjs(currentMonth).format("YYYY/MM"),
          date: "",
          contents: "",
          paidTo: "",
          cost: "",
          monthTotal: monthTotal,
          invoiceFlg: "",
          note: "集計レコード",
          createdAt: "",
          updatedAt: "",
          monthTotalFlg: true,
        });
        outputData.push(...group);
      });

      // CSV出力用の配列を作成
      outputCSV = [
        csvHeader,
        ...outputData.map((obj) => [
          obj.employeeId,
          obj.name ?? "",
          obj.displayNo,
          obj.ym ?? "",
          obj.date ? dayjs(obj.date).format("YYYY/MM/DD(dd)") : "",
          obj.contents,
          obj.paidTo,
          obj.cost,
          obj.monthTotal ?? "",
          obj.monthTotalFlg ? "" : obj.invoiceFlg ? "有り" : "無し", //"",true,false
          obj.note,
        ]),
      ];
    }

    const now = dayjs().format("YYYYMMDD_HHmmss");
    const csvData = iconv.encode(stringify(outputCSV), "Shift_JIS");

    // CSV出力処理
    return new NextResponse(csvData, {
      headers: {
        "Content-Disposition": `attachment; filename=${ym}_${now}_reimbursement.csv`,
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
