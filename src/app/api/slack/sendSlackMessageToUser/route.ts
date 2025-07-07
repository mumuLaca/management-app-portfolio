import prisma from "@/lib/prismadb";
import { WebClient } from "@slack/web-api";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description
 * 本部 → ユーザー にslackメッセージを送信する
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json();

    // 宛先のID取得
    const recipientID = await getMailRecipient(email);

    if (recipientID) {
      // 送信者としてBOTを使用
      const botClient = new WebClient(process.env.SLACK_BOT_TOKEN);

      // slackにメッセージ送信
      await botClient.chat.postMessage({
        channel: recipientID,
        text: message,
      });

      return NextResponse.json(
        { message: "Succeeded to send Slack message." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send Slack message: Recipient not found." },
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
 * @param email　宛先メールドレス
 * @returns 宛先ID
 */
const getMailRecipient = async (email: string) => {
  try {
    // findFirstはwhereがundefinedでもレコードを取ってくるので事前に弾く
    if (!email) {
      throw new Error("parameter error.");
    }

    // メールアドレスからslackユーザーデータを取得
    const userData = await prisma.user.findFirst({
      where: {
        email: email,
      },
      include: {
        accounts: true,
      },
    });

    // 連携サービスが複数にならなければaccountレコードは増えないので
    // とりあえず最初のレコードを取得。
    // 増えたらproviderで判定すれば良いと思う。
    const account = userData?.accounts[0];
    const userId = account?.providerAccountId;

    return userId ?? null;
  } catch (err) {
    console.error({ message: "error" }, err);
    return null;
  }
};
