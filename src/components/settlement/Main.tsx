"use client";

import Header from "@/components/settlement/Header";
import List from "@/components/settlement/List";
import dayjs from "@/lib/dayjs";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import ScrollUp from "@/components/common/ScrollUp";
import { Spinner } from "react-bootstrap";
import useSWR, { Fetcher } from "swr";
import axios from "axios";
import { TypeMonthlySettlement } from "@/types/settlement";

/** fetcher */
const fetcher: Fetcher<TypeMonthlySettlement, string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * 旅費精算メイン画面
 */
export default function SettlementMain() {
  /** 年月の初期値設定 */
  const initialYearMonth = (() => {
    const cookie = getCookie("targetYearAndMonth");
    // cookieの値を取得した直後に削除
    if (cookie) {
      deleteCookie("targetYearAndMonth");
      return cookie.toString();
    }
    return dayjs().format("YYYYMM");
  })();

  const [yearMonth, setYearMonth] = useState<string>(initialYearMonth);
  const [inputCheck, setInputCheck] = useState<string>("");

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();
  // 旅費精算関連データ取得
  const { data, error, mutate, isLoading } = useSWR(
    session ? `/api/settlement/get/${yearMonth}/${session.employee.id}` : null,
    fetcher,
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // 再試行は5回までしかできません。
        if (retryCount >= 5) return;

        // 5秒後に再試行します。
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  // データ取得中はローディング
  if (sessionStatus === "loading" || isLoading || !data) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // useSWRによるデータ取得が失敗した場合
  if (error) {
    // 画面を再描画
    window.location.reload();
  }

  return (
    <>
      <div id="top" />
      <div className="mt-3" id="chapter2">
        <div>
          <Header
            employee={session!.employee}
            settlementData={data!}
            yearMonth={yearMonth}
            setTargetyearMonth={setYearMonth}
            editable={true}
            inputCheck={inputCheck}
          />
        </div>
        <main>
          <List
            employee={session!.employee}
            settlementData={data!}
            mutateSettlement={mutate}
            editable={true}
            setInputCheck={setInputCheck}
          />
        </main>
      </div>
      <ScrollUp />
    </>
  );
}
