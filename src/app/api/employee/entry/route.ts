import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

type EmployeeData = {
  id: string;
  email: string;
  name: string;
  section: string;
  admin: string;
};

/**
 * @description
 * メンバー情報登録API
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EmployeeData;
    const { id, email, name, section, admin } = body;

    // 必須パラメータのチェック
    if (!id || !email || !name || !section) {
      return NextResponse.json(
        { message: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    // employeeへ登録
    const newEmployee = await prisma.employee.create({
      data: {
        id: Number(id),
        email,
        name,
        section,
        admin: admin ?? "0",
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
