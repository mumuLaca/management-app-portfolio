"use client";

import Header from "@/components/attendance/Header";
import Summary from "@/components/attendance/Summary";
import List from "@/components/attendance/List";
import ScrollUp from "@/components/common/ScrollUp";
import dayjs from "@/lib/dayjs";
import { useSession } from "next-auth/react";
import { JSX, useEffect, useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import useSWR, { Fetcher } from "swr";
import { TypeMonthlyAttendance } from "@/types/attendance";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type APIError = Error & {
  status?: number;
  code?: string;
};

/** fetcher */
const fetcher: Fetcher<TypeMonthlyAttendance, string> = async (url) => {
  return await axios
    .get(url)
    .then((res) => res.data)
    .catch((err) => {
      const errorData = err.response.data;
      const error: APIError = new Error("API error");
      error.status = err.response.status;
      error.code = errorData.errorCode || "UNKNOWN";
      error.message = errorData.message || "不明なエラー";
      throw error;
    });
};

/**
 * @description
 * 勤務表メイン画面
 */
export default function AttendanceMain() {
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
  const [alert, setAlert] = useState<JSX.Element>(<></>);
  const router = useRouter();

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();
  // 勤務表関連データ取得
  const { data, error, mutate, isLoading } = useSWR(
    session ? `/api/attendance/get/${yearMonth}/${session.employee.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (error) {
      if (error.code === "NO_APPROVAL_RECORD") {
        setAlert(
          <Alert>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        );
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setAlert(
          <Alert>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        );
      }
    }
  }, [error, router]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/");
    }
  }, [sessionStatus, router]);

  // データ取得中はローディング
  if (sessionStatus === "loading" || isLoading || !data) {
    return (
      <div className="w-full h-full px-4 pt-3">
        {error && alert}
        <div className="w-full h-full flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="top" />
      <div className="mt-3" id="chapter2">
        <div>
          <Header
            employee={session!.employee}
            attendanceData={data!}
            setTargetyearMonth={setYearMonth}
            editable={true}
            inputCheck={inputCheck}
          />

          <Summary attendanceData={data!} />
        </div>

        <main>
          <List
            employee={session!.employee}
            attendanceData={data!}
            mutateAttendance={mutate}
            editable={true}
            setInputCheck={setInputCheck}
          />
        </main>
        <ScrollUp />
      </div>
    </>
  );
}
