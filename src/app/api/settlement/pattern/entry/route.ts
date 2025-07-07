import prisma from "@/lib/prismadb";
import { SettlementPattern } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description
 * 旅費精算パターンDB‗登録API
 * @param request request data
 */
export async function POST(request: NextRequest) {
  let result = null;

  // パラメーター取得
  const param = (await request.json()) as SettlementPattern;

  try {
    // クエリ情報の定義
    result = await prisma.settlementPattern.create({
      data: {
        employeeId: param.employeeId,
        title: param.title,
        form: param.form,
        method: param.method,
        departure: param.departure,
        arrival: param.arrival,
        transportation: param.transportation,
        cost: parseInt(String(param.cost)),
        note: param.note,
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    return NextResponse.json(
      { message: "旅費精算パターンの登録に失敗しました" },
      { status: 400 }
    );
  }
}
