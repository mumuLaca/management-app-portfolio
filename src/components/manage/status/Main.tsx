"use client";

import useSWR, { Fetcher } from "swr";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import dayjs from "@/lib/dayjs";
import Header from "@/components/manage/status/Header";
import List from "@/components/manage/status/List";
import { TypeAPIResponse } from "@/app/api/approval/status/[yearMonth]/[filterSection]/route";
import { AdminRights, ReportPattern } from "@/lib/constants";

/** fetcher */
const fetcher: Fetcher<TypeAPIResponse[], string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * メンバー管理画面
 */
export default function StatusMain() {
  const today = dayjs();
  const [yearMonth, setyearMonth] = useState<string>(today.format("YYYYMM"));
  const [filterReport, setFilterReport] = useState<string>(
    ReportPattern.attendance.code
  );
  const [filterSection, setFilterSection] = useState<string>("");

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();

  // セッションが取得できた後に filterSection を設定
  useEffect(() => {
    if (
      session &&
      session.employee &&
      session.employee.admin === AdminRights.leader.code
    ) {
      // セッションから filterSection を設定
      setFilterSection(session.employee.section || "");
    }
  }, [session]); // session が更新される度に実行

  // 提出状況一覧の取得
  const {
    data: employeeList,
    error,
    isLoading,
    mutate,
  } = useSWR(
    session && (filterSection || filterSection === "")
      ? `/api/approval/status/${yearMonth}/${filterSection || "none"}`
      : null,
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
  if (sessionStatus === "loading" || isLoading || !employeeList) {
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
      <div className="mt-3">
        <Header
          session={session!}
          yearMonth={yearMonth}
          setyearMonth={setyearMonth}
          filterReport={filterReport}
          setFilterReport={setFilterReport}
          filterSection={filterSection}
          setFilterSection={setFilterSection}
        />
      </div>
      <main>
        <List
          session={session!}
          employeeList={employeeList!}
          mutateEmployeeList={mutate}
          yearMonth={yearMonth}
          filterReport={filterReport}
        />
      </main>
    </>
  );
}
