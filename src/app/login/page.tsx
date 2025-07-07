import React from "react";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";
import LoginMain from "@/components/login/Main";

export const metadata: Metadata = {
  title: `ログイン`,
  description: "アプリケーションにログインします。",
  ...SiteMeta,
};

/**
 * @description
 * ログイン画面
 */
export default function LoginPage() {
  return <LoginMain />;
}
