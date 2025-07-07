import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { Settlement } from "@prisma/client";

/**
 * @description
 * リストの表示順を入れ替えるAPI
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const { changeItems }: { changeItems: Settlement[] } = await request.json();

    // 表示順（displayNo）を入れ替える
    [changeItems[0].displayNo, changeItems[1].displayNo] = [
      changeItems[1].displayNo,
      changeItems[0].displayNo,
    ];

    // クエリ作成
    const query = changeItems.map((obj) => {
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

    // クエリ実行
    await prisma.$transaction(query);

    return NextResponse.json({ message: "表示順の更新が完了しました" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "表示順の更新に失敗しました" },
      { status: 400 }
    );
  }
}
