"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import scrollStyle from "@/styles/CustomScroll.module.css";
import { usePathname } from "next/navigation";
import Header from "@/components/common/Header";
import SideBar from "@/components/common/SideBar";

/**
 * @description
 * 共通レイアウト
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarShow, setSidebarShow] = useState<boolean>(false);
  const pathname = usePathname();

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();

  // データ取得中はローディング
  if (sessionStatus === "loading") {
    return <></>;
  }

  let headerDisplayFlg = false;
  // ログインページの場合はヘッダーとサイドバーを表示しない
  if (
    pathname === "/login" ||
    pathname === "/maintenance" ||
    pathname.startsWith("/newWindow")
  ) {
    headerDisplayFlg = true;
  }

  return (
    <div style={{ height: "100vh" }}>
      {headerDisplayFlg ? (
        <div>{children}</div>
      ) : (
        <div>
          <div className="headerComponent">
            <Header session={session!} setSidebarShow={setSidebarShow} />
          </div>
          <div className="componentBody">
            <SideBar
              session={session!}
              sidebarShow={sidebarShow}
              setSidebarShow={setSidebarShow}
            />
            <main className={`mainComponent ${scrollStyle.dailyScrollStyle}`}>
              {children}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
