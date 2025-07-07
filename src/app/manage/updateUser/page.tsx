import React from "react";
import UpdateUserMain from "@/components/manage/updateUser/Main";
import { Metadata } from "next";
import { SiteMeta } from "@/lib/constants";

export const metadata: Metadata = {
  title: `メンバー情報更新`,
  description: "メンバー情報の更新を行います。",
  ...SiteMeta,
};

/**
 * @description
 * メンバー情報更新画面
 */
export default function UpdateUserPage() {
  return <UpdateUserMain />;
}
