import HomeMain from "@/components/home/Main";
import { SiteMeta } from "@/lib/constants";
import { Metadata } from "next";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: `HOME`,
  description: "ホーム画面",
  ...SiteMeta,
};

/**
 * @description
 * ホーム画面
 */
export default async function Home() {
  const res = await fetch(`${getApiBaseUrl()}/api/approval/create/initData`, {
    method: "POST",
    cache: "no-store",
    headers: Object.fromEntries(await headers()),
    credentials: "include",
  });
  const initData = await res.json();

  return (
    <div className="main-padding">
      <HomeMain initData={initData} />
    </div>
  );
}
