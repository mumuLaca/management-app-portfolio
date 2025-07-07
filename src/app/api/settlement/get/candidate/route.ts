import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

/**
 * @description
 * 入力候補の取得
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  // パラメーター取得
  const { id } = await request.json();

  try {
    // 交通機関
    const transportationList = await prisma.settlement.findMany({
      where: { employeeId: parseInt(id) },
      select: { transportation: true },
      distinct: ["transportation"],
      orderBy: { createdAt: "desc" }, // 最新順
      take: 6, // 最大6件
    });

    // 発駅/宿泊地
    const departureList = await prisma.settlement.findMany({
      where: { employeeId: parseInt(id) },
      select: { departure: true },
      distinct: ["departure"],
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // 着駅
    const arrivalList = await prisma.settlement.findMany({
      where: { employeeId: parseInt(id) },
      select: { arrival: true },
      distinct: ["arrival"],
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // 備考
    const noteList = await prisma.settlement.findMany({
      where: { employeeId: parseInt(id) },
      select: { note: true },
      distinct: ["note"],
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // 取得結果を返却
    return NextResponse.json({
      candidateTransportation:
        transportationList?.map((item) => item.transportation) || [],
      candidateDeparture: departureList?.map((item) => item.departure) || [],
      candidateArrival: arrivalList?.map((item) => item.arrival) || [],
      candidateNote: noteList?.map((item) => item.note) || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "入力候補の取得に失敗しました" },
      { status: 400 }
    );
  }
}
