import React from "react";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";
import DailyMain from "@/components/daily/Main";

export const metadata: Metadata = {
  title: `勤務表`,
  description: "勤怠の登録を行います。",
  ...SiteMeta,
};

/**
 * @description
 * 勤務表画面
 */
export default function DailyPage() {
  return <DailyMain />;
}
