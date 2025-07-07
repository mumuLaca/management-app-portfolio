import React from "react";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";
import StatusMain from "@/components/manage/status/Main";

export const metadata: Metadata = {
  title: `ユーザー管理`,
  description: "各種書類の提出状況を管理します。",
  ...SiteMeta,
};

/**
 * @description
 * ユーザー管理画面
 */
export default function StatusPage() {
  return <StatusMain />;
}
