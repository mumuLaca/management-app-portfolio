import prisma from "@/lib/prismadb";
import { Employee } from "@prisma/client";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * ルーム情報更新API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { roomId, employeeId, fromDate, toDate, trainerList, officeStaffList } =
    req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.roomInfo.update({
        where: {
          employeeId_roomId: {
            employeeId: employeeId,
            roomId: roomId,
          },
        },
        data: {
          fromDate: dayjs
            .utc(fromDate)
            .startOf("month")
            .startOf("day")
            .toDate(),
          toDate: dayjs.utc(toDate).endOf("month").startOf("day").toDate(),
        },
      });

      const existingRoomMembers = await prisma.roomMember.findMany({
        where: {
          roomId: roomId,
        },
        select: {
          roomId: true,
          employeeId: true,
        },
      });

      if ((existingRoomMembers ?? []).length > 0) {
        // ローカルのセクション情報からindexNoを抽出
        const sectionIndexNos = [
          ...trainerList.map((obj: Employee) => obj.id),
          ...officeStaffList.map((obj: Employee) => obj.id),
        ];

        // DBと変更後ローカルのルームメンバーを比較し、ローカルから除外された（部屋主を除く）メンバーを削除対象として抽出
        const toDelete = existingRoomMembers.filter(
          (existing) =>
            employeeId !== existing.employeeId &&
            !sectionIndexNos.includes(existing.employeeId)
        );

        // 削除処理
        await prisma.roomMember.deleteMany({
          where: {
            roomId: roomId,
            employeeId: {
              in: toDelete.map((item) => item.employeeId),
            },
          },
        });

        // ローカルで削除されたindexNoをDBから抽出
        const toCreate = [...trainerList, ...officeStaffList].filter(
          (existing) =>
            !existingRoomMembers
              .map((obj) => obj.employeeId)
              .includes(existing.employeeId)
        );

        // ルームメンバーの参加者をupdate
        const postSectionPromises = toCreate.map((member) =>
          prisma.roomMember.upsert({
            where: {
              roomId_employeeId: {
                roomId: roomId,
                employeeId: member.id,
              },
            },
            update: {
              authority: member.authority,
            },
            create: {
              roomId: roomId,
              employeeId: member.id,
              employeeName: member.name,
              authority: member.authority,
            },
          })
        );

        await Promise.all(postSectionPromises);
      }
    });

    res.status(200).json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
}
