import prisma from "@/lib/prismadb";
import { WebClient } from "@slack/web-api";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description
 * 選択したメンバーにslackメッセージを送信する
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const { title, content, addressList, senderName } = await request.json();

    // 宛先のID取得
    const recipientIDList = await getMailRecipient(addressList);

    if (recipientIDList && recipientIDList.length > 0) {
      // 送信者としてBOTを使用
      const botClient = new WebClient(process.env.SLACK_BOT_TOKEN);

      // slackにメッセージ送信
      const messagePromises = recipientIDList.map(
        async (recipientID: string) => {
          const message = `${title}\nfrom: ${senderName}\n\nメッセージ:\n${content}`;

          return botClient.chat.postMessage({
            channel: recipientID,
            text: message,
          });
        }
      );

      // すべてのメッセージ送信が完了するまで待機
      await Promise.all(messagePromises);

      return NextResponse.json(
        { message: "Succeeded to send Slack messages." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send Slack message." },
      { status: 500 }
    );
  } catch (err) {
    console.error("Failed to send Slack message : ", err);
    return NextResponse.json(
      { error: "Failed to send Slack message." },
      { status: 500 }
    );
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

    // メールアドレスからslackメンバーデータを取得
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
    return [];
  }
};
