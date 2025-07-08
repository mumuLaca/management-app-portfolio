import prisma from "@/lib/prismadb";
import { Employee } from "@prisma/client";
import dayjs from "dayjs";
import { DailyReportAuthority } from "@/lib/constants";
import { nanoid } from "nanoid";

/**
 * @description
 * 日報ルーム作成API
 *
 * @param request Request data
 */
export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    // 16文字のランダムなIDを生成
    const roomId = nanoid(16);

    // RoomMemberTBLに登録するためのデータを作成
    // 自分、育成担当、本社担当の情報を追加
    const mergedRoomMember = [
      {
        id: reqBody.employeeId,
        name: reqBody.employeeName,
        authority: DailyReportAuthority.mySelf.code,
      },
      ...reqBody.trainerList.map((obj: Employee) => ({
        id: obj.id,
        name: obj.name,
        authority: DailyReportAuthority.trainer.code,
      })),
      ...reqBody.officeStaffList.map((obj: Employee) => ({
        id: obj.id,
        name: obj.name,
        authority: DailyReportAuthority.officeStaff.code,
      })),
    ];

    await prisma.$transaction(async (prisma) => {
      // ルーム情報を作成
      await prisma.roomInfo.create({
        data: {
          employeeId: reqBody.employeeId,
          roomId: roomId,
          dailyReportType: reqBody.dailyReportType,
          fromDate: dayjs
            .utc(reqBody.fromDate)
            .startOf("month")
            .startOf("day")
            .toDate(),
          toDate: dayjs
            .utc(reqBody.toDate)
            .endOf("month")
            .startOf("day")
            .toDate(),
        },
      });

      // ルームメンバーを登録
      for (const member of mergedRoomMember) {
        await prisma.roomMember.create({
          data: {
            roomId: roomId,
            employeeId: member.id,
            employeeName: member.name,
            authority: member.authority,
          },
        });

        // 社員情報の日報権限を更新
        if (member.authority !== DailyReportAuthority.mySelf.code) {
          await prisma.employee.update({
            where: {
              id: member.id,
            },
            data: {
              dailyReportAuthority: member.authority,
            },
          });
        }
      }
    });

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 400 });
  }
}
