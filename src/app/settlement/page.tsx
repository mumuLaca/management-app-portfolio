import React from "react";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";
import SettlementMain from "@/components/settlement/Main";

export const metadata: Metadata = {
  title: `出張交通費精算画面`,
  description: "出張交通費精算の登録を行います。",
  ...SiteMeta,
};

/**
 * @description
 * 出張交通費精算画面
 */
export default function SettlementPage() {
  return <SettlementMain />;
}
