import React from "react";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";
import ReimbursementMain from "@/components/reimbursement/Main";

export const metadata: Metadata = {
  title: `立替精算表`,
  description: "立替精算の登録を行います。",
  ...SiteMeta,
};

/**
 * @description
 * 立替精算表画面
 */
export default function ReimbursementPage() {
  return <ReimbursementMain />;
}
