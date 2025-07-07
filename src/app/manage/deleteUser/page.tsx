import React from "react";
import DeleteUserMain from "@/components/manage/deleteUser/Main";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `メンバー削除`,
  description: "メンバーの削除を行います。",
  ...SiteMeta,
};

/**
 * @description
 * メンバー削除画面
 */
export default function DeleteUserPage() {
  return <DeleteUserMain />;
}
