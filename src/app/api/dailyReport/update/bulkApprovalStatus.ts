import { ApprovalStatusDiary } from "@/lib/constants";
import prisma from "@/lib/prismadb";
import { WebClient } from "@slack/web-api";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description
 * 日報‗承認ステータス一括更新API
 *
 * @param req request data
 * @param res response data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    roomId,
    startDate,
    endDate,
    approvalStatus,
    addressList,
    content,
    messageFormOpenFlg,
  } = req.body;

  try {
    const getDate = dayjs
      .utc(startDate as string)
      .startOf("day")
      .toDate();
    const lteDate = dayjs
      .utc(endDate as string)
      .endOf("day")
      .toDate();

    const includeStatuses: string[] = [];

    switch (approvalStatus) {
      // 提出
      case ApprovalStatusDiary.submitted.code:
        includeStatuses.push(ApprovalStatusDiary.noInput.code);
        includeStatuses.push(ApprovalStatusDiary.saveTemporary.code);
        break;
      // 育成担当承認
      case ApprovalStatusDiary.firstApproval.code:
        includeStatuses.push(ApprovalStatusDiary.submitted.code);
        break;
      // 本社担当承認
      case ApprovalStatusDiary.secondApproval.code:
        includeStatuses.push(ApprovalStatusDiary.firstApproval.code);
        break;
    }

    const statusCondition =
      includeStatuses.length > 0 ? { in: includeStatuses } : undefined;

    await prisma.diaryPost.updateMany({
      where: {
        roomId: String(roomId),
        date: {
          gte: getDate,
          lte: lteDate,
        },
        ...(statusCondition && { status: statusCondition }),
      },
      data: {
        status: approvalStatus,
      },
    });

    if (messageFormOpenFlg === "true") {
      // 宛先のID取得
      const recipientIDList = await getMailRecipient(addressList);

      if (recipientIDList && recipientIDList.length > 0) {
        // 送信者としてBOTを使用
        const botClient = new WebClient(process.env.SLACK_BOT_TOKEN);

        // slackにメッセージ送信
        recipientIDList.forEach(async (recipientID: string) => {
          await botClient.chat.postMessage({
            channel: recipientID,
            text: content,
          });
        });
      }
    }

    res.status(200).json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
}

/**
 * @description
 *　メールアドレスよりslackのIDを特定
 *
 * @param addressList
 * @returns 宛先ID
 */
const getMailRecipient = async (addressList: string[]) => {
  try {
    // findFirstはwhereがundefinedでもレコードを取ってくるので事前に弾く
    if (!addressList || addressList.length === 0) {
      throw new Error("parameter error.");
    }

    // メールアドレスからslackユーザーデータを取得
    const userData = await prisma.user.findMany({
      where: {
        email: {
          in: addressList,
        },
      },
      include: {
        accounts: true,
      },
    });

    if ((userData?.length ?? 0) > 0) {
      const accountList = userData.map(
        (user) => user.accounts[0].providerAccountId
      );

      return accountList;
    }

    return [];
  } catch (err) {
    console.error({ message: "error" }, err);
  }
};
