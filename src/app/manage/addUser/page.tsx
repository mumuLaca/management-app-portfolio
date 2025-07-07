import React from "react";
import AddUserMain from "@/components/manage/addUser/Main";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `新規メンバー登録`,
  description: "メンバーの新規登録を行います。",
  ...SiteMeta,
};

/**
 * @description
 * メンバー追加画面
 */
export default function AddUserPage() {
  return <AddUserMain />;
}
