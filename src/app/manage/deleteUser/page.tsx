import React from "react";
import DeleteUserMain from "@/components/manage/deleteUser/Main";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `ユーザー削除`,
  description: "社員の削除を行います。",
  ...SiteMeta,
};

/**
 * @description
 * ユーザー削除画面
 */
export default function DeleteUserPage() {
  return <DeleteUserMain />;
}
