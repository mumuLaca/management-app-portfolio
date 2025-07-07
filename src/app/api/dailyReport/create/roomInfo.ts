import prisma from "@/lib/prismadb";
import { Employee, Reimbursement } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";
import { Prisma } from "@prisma/client";
import { DiaryAuthority } from "@/lib/constants";
import { nanoid } from "nanoid";

/**
 * @description
 * 日報ルーム作成API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reimbursement[] | Prisma.BatchPayload | null>
) {
  let result = null;

  // パラメーター取得
  const request = req.body;
  try {
    // 16文字のランダムなIDを生成
    const roomId = nanoid(16);

    // RoomMemberTBLに登録するためのデータを作成
    // 自分、育成担当、本社担当の情報を追加
    const mergedRoomMember = [
      {
        id: request.employeeId,
        name: request.employeeName,
        authority: DiaryAuthority.mySelf.code,
      },
      ...request.trainerList.map((obj: Employee) => ({
        id: obj.id,
        name: obj.name,
        authority: DiaryAuthority.trainer.code,
      })),
      ...request.officeStaffList.map((obj: Employee) => ({
        id: obj.id,
        name: obj.name,
        authority: DiaryAuthority.officeStaff.code,
      })),
    ];

    result = await prisma.$transaction(async (prisma) => {
      // ルーム情報を作成
      await prisma.roomInfo.create({
        data: {
          employeeId: request.employeeId,
          roomId: roomId,
          diaryType: request.diaryType,
          fromDate: dayjs
            .utc(request.fromDate)
            .startOf("month")
            .startOf("day")
            .toDate(),
          toDate: dayjs
            .utc(request.toDate)
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
        if (member.authority !== DiaryAuthority.mySelf.code) {
          await prisma.employee.update({
            where: {
              id: member.id,
            },
            data: {
              diaryAuthority: member.authority,
            },
          });
        }
      }
    });

    res.status(200).json(null);
  } catch (err) {
    // エラーの場合ログを出力
    console.error(err);

    res.status(400).json(null);
  }
}
