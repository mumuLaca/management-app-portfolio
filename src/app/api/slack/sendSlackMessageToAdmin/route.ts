import { WebClient } from "@slack/web-api";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description
 * ユーザー → 本部 にslackメッセージを送信する
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // 送信者としてBOTを使用
    const botClient = new WebClient(process.env.SLACK_BOT_TOKEN);

    // 宛先チャンネルIDを取得
    const addressId: string = process.env.SLACK_APP_WINDOW ?? "";

    // botbClientか宛先チャンネルIDを取得できなかった場合はエラー
    if (!botClient || !addressId)
      return NextResponse.json(
        { error: "Failed to send Slack message." },
        { status: 500 }
      );

    // メッセージ送信
    await botClient.chat.postMessage({
      channel: addressId,
      text: message,
    });

    return NextResponse.json(
      { message: "Succeeded to send Slack message." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to send Slack message : ", err);
    return NextResponse.json(
      { error: "Failed to send Slack message." },
      { status: 500 }
    );
  }
}
