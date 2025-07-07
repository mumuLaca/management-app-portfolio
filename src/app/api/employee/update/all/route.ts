import prisma from "@/lib/prismadb";
import { Employee } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface UpdateEmployee {
  email: string;
  name: string;
  section: string;
  admin: string;
  updatedAt: Date;
}

interface TypeUpdateData {
  where: { id: number };
  data: UpdateEmployee;
}

type RequestBody = {
  params: {
    updateEmployees: Employee[];
  };
};

/**
 * @description
 * メンバー情報更新API
 * 変更対象のメンバー情報を一括更新する
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { updateEmployees } = body.params;

    if (
      !updateEmployees ||
      !Array.isArray(updateEmployees) ||
      updateEmployees.length === 0
    ) {
      return NextResponse.json(
        { message: "更新対象のメンバー情報が指定されていません" },
        { status: 400 }
      );
    }

    let dataList: TypeUpdateData[] = [];
    updateEmployees.forEach((employee: Employee) => {
      const addData = {
        where: { id: employee.id },
        data: {
          email: employee.email,
          name: employee.name,
          section: employee.section,
          admin: employee.admin,
          updatedAt: new Date(),
        },
      };

      dataList = [...dataList, addData];
    });

    // employeeへ一括更新
    const result = await prisma.$transaction(
      dataList.map((data: TypeUpdateData) => prisma.employee.update(data))
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "サーバーエラー" }, { status: 500 });
  }
}
