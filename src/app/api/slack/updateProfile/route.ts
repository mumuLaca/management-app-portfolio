import prisma from "@/lib/prismadb";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description
 * slackプロフィール画像を更新するAPI
 *
 * @param request request data
 */
export async function POST(request: NextRequest) {
  const { accessToken, email } = await request.json();

  try {
    // Slackから最新プロフィールを取得
    const response = await axios.get(
      "https://slack.com/api/users.profile.get",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // usersテーブルに保存される512pxのURLを取得
    const imageUrl = response.data.profile.image_512;

    // PrismaでUserテーブル更新
    await prisma.user.update({
      where: { email: email },
      data: {
        image: imageUrl,
      },
    });

    return NextResponse.json(
      { message: "Succeeded to update profile data." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to update Slack message : ", err);
    return NextResponse.json(
      { error: "Failed to update Slack message." },
      { status: 500 }
    );
  }
}
