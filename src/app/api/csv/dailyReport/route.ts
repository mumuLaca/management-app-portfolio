import { AbsentData, WorkStyle } from "@/lib/constants";
import prisma from "@/lib/prismadb";
import {
  calcActiveTime,
  calcLateNightOverTime,
  calcLegalHolidayActiveTime,
  calcOverTime,
} from "@/utils/caluculationTimeUtil";
import dayjs from "@/lib/dayjs";
import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";
import { stringify } from "csv-stringify/sync";

interface outputObject {
  [key: number]: {
    name: string;
    section: string;
    targetYearMonth: string;
    totalVacation: number;
    totalLate: number;
    totalLeaveEarly: number;
    totalOffice: number;
    totalTelework: number;
    totalOverTime: number;
    totalLegalHolActive: number;
    totalLNOverTime: number;
    totalActive: number;
  };
}

// CSVレイアウトヘッダー
const csvHeader = [
  "メンバー番号",
  "氏名",
  "所属",
  "報告年月",
  "有給休暇取得日数",
  "遅刻回数",
  "早退回数",
  "出社日数",
  "在宅勤務日数",
  "時間外労働時間",
  "休日労働時間",
  "深夜労働時間",
  "実働時間",
];

/**
 * @description
 * 勤務データCSV出力
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
          statusOfAttendance: approvalStatus,
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
      // DB操作
      const result = await prisma.attendance.findMany({
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
              section: true,
            },
          },
        },
      });

      const outputData: outputObject = {};

      // メンバー別に集計を行い配列に格納
      for (const row of result) {
        const { employeeId, absentCode, workStyle } = row;

        const overTime = calcOverTime(row);
        const lNOverTime = calcLateNightOverTime(row);
        const legalHolActive = calcLegalHolidayActiveTime(row);
        const activeTime = calcActiveTime(row);

        if (outputData[employeeId]) {
          if (absentCode === AbsentData.allDayOff.code)
            outputData[employeeId].totalVacation++;
          if (absentCode === AbsentData.halfDayOff.code)
            outputData[employeeId].totalVacation += 0.5;
          if (absentCode === AbsentData.late.code)
            outputData[employeeId].totalLate++;
          if (absentCode === AbsentData.leaveEarly.code)
            outputData[employeeId].totalLeaveEarly++;
          if (workStyle === WorkStyle.office.code)
            outputData[employeeId].totalOffice++;
          if (workStyle === WorkStyle.telework.code)
            outputData[employeeId].totalTelework++;
          outputData[employeeId].totalOverTime += overTime ? overTime : 0;
          outputData[employeeId].totalLNOverTime += lNOverTime ? lNOverTime : 0;
          outputData[employeeId].totalLegalHolActive += legalHolActive
            ? legalHolActive
            : 0;
          outputData[employeeId].totalActive += activeTime ? activeTime : 0;
        } else {
          const { name, section } = row.employee;

          outputData[employeeId] = {
            name: name,
            section: section,
            targetYearMonth: dayjs.utc(`${ym}`).format("YYYY/MM"),
            totalVacation:
              absentCode === AbsentData.allDayOff.code
                ? 1
                : absentCode === AbsentData.halfDayOff.code
                ? 0.5
                : 0,
            totalLate: absentCode === AbsentData.late.code ? 1 : 0,
            totalLeaveEarly: absentCode === AbsentData.leaveEarly.code ? 1 : 0,
            totalOffice: workStyle === WorkStyle.office.code ? 1 : 0,
            totalTelework: workStyle === WorkStyle.telework.code ? 1 : 0,
            totalOverTime: overTime || 0,
            totalLegalHolActive: legalHolActive || 0,
            totalLNOverTime: lNOverTime || 0,
            totalActive: activeTime || 0,
          };
        }
      }

      // CSV出力用の配列を作成
      outputCSV = [
        csvHeader,
        ...Object.entries(outputData).map(([employeeId, values]) => [
          employeeId,
          values.name,
          values.section,
          values.targetYearMonth,
          values.totalVacation,
          values.totalLate,
          values.totalLeaveEarly,
          values.totalOffice,
          values.totalTelework,
          values.totalOverTime > 0 ? values.totalOverTime.toFixed(2) : 0,
          values.totalLegalHolActive > 0
            ? values.totalLegalHolActive.toFixed(2)
            : 0,
          values.totalLNOverTime > 0 ? values.totalLNOverTime.toFixed(2) : 0,
          values.totalActive > 0 ? values.totalActive.toFixed(2) : 0,
        ]),
      ];
    }

    const now = dayjs().format("YYYYMMDD_HHmmss");
    const csvData = iconv.encode(stringify(outputCSV), "Shift_JIS");

    // CSV出力処理
    return new NextResponse(csvData, {
      headers: {
        "Content-Disposition": `attachment; filename=${ym}_${now}_attendance.csv`,
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
