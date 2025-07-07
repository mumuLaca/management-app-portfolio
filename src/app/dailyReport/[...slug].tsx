import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/DailyReport.module.css";
import TweetArea from "@/components/dailyReport/TweetArea";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import { RoomMember } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/router";
import { DailyReportType } from "@/lib/constants";
import InformationWrapper from "@/components/dailyReport/InformationWrapper";
import ReportCover from "@/components/dailyReport/ReportCover";

export interface DailyReportCommonUrlParams {
  roomId: string;
  dailyReportType: string;
  fromDate: string;
  toDate: string;
}

export default function DailyReport() {
  const [date, setDate] = useState<Date>(new Date());
  const [joinUsers, setJoinUsers] = useState<RoomMember[]>([]);
  const [postDataUpdateFlg, setPostDataUpdateFlg] = useState<boolean>(true);
  const [modalTweetInfoOpenFlg, setModalTweetInfoOpenFlg] =
    useState<boolean>(false);
  const [coverOpenFlg, setCoverOpenFlg] = useState<boolean>(false);

  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const { slug } = router.query as {
    slug: string[];
  };

  const urlParams: DailyReportCommonUrlParams = useMemo(() => {
    return {
      roomId: slug?.[0],
      dailyReportType: slug?.[1],
      fromDate: slug?.[2],
      toDate: slug?.[3],
    };
  }, [slug]);

  const stableSetPostDataUpdateFlg = useCallback((value: boolean) => {
    setPostDataUpdateFlg(value);
  }, []);

  /** 日報の初期日付を取得 */
  const calcTargetDate = useCallback(() => {
    let targetDate = dayjs().startOf("day");
    const fromDate = dayjs(urlParams.fromDate).startOf("day");
    if (fromDate.isAfter(targetDate)) {
      targetDate = fromDate;
    }

    switch (urlParams.dailyReportType) {
      // 日報：本日日付
      case DailyReportType.daily.code:
        return targetDate.toDate();
      // 週報：今週の月曜日
      case DailyReportType.weekly.code:
        if (targetDate.startOf("week").month() !== targetDate.month()) {
          return targetDate
            .startOf("week")
            .add(1, "week")
            .add(1, "day")
            .toDate();
        }
        return targetDate.startOf("week").add(1, "day").toDate();
      // 月報：今月の初日
      case DailyReportType.monthly.code:
        return targetDate.startOf("month").toDate();
      // 四半期報告：今四半期の初日
      case DailyReportType.quarter.code:
        const month = targetDate.month(); // 0-11で月が返る
        const quarterStartMonth = Math.floor(month / 3) * 3;
        return targetDate.month(quarterStartMonth).startOf("month").toDate();
      // case DailyReportType.quarter.code:
      default:
        return dayjs().toDate();
    }
  }, [urlParams.fromDate, urlParams.dailyReportType]);

  /** 画面初期表示時、ルームメンバーリストを取得 */
  useEffect(() => {
    const getJoinUser = async () => {
      try {
        const res = await axios.post("/api/dailyReport/get/joinUser", {
          roomId: urlParams.roomId,
        });
        setJoinUsers(res.data);
      } catch (e) {
        console.error("参加者取得エラー:", e);
      }
    };

    getJoinUser();

    // 日報の初期日付を取得
    const target = calcTargetDate();
    setDate(target);

    // カレンダー情報を最新化
    setPostDataUpdateFlg(true);
  }, [urlParams, calcTargetDate]);

  return (
    <div className={styles.container}>
      <div className={styles.tweetSection}>
        {coverOpenFlg ? (
          <ReportCover
            session={session!}
            urlParams={urlParams}
            date={date}
            coverOpenFlg={coverOpenFlg}
            setModalTweetInfoOpenFlg={setModalTweetInfoOpenFlg}
          />
        ) : (
          <TweetArea
            session={session!}
            urlParams={urlParams}
            sessionStatus={sessionStatus}
            date={date}
            setPostDataUpdateFlg={stableSetPostDataUpdateFlg}
            setModalTweetInfoOpenFlg={setModalTweetInfoOpenFlg}
          />
        )}
      </div>
      <InformationWrapper
        urlParams={urlParams}
        date={date}
        setDate={setDate}
        postDataUpdateFlg={postDataUpdateFlg}
        setPostDataUpdateFlg={stableSetPostDataUpdateFlg}
        joinUsers={joinUsers!}
        modalTweetInfoOpenFlg={modalTweetInfoOpenFlg}
        setModalTweetInfoOpenFlg={setModalTweetInfoOpenFlg}
        coverOpenFlg={coverOpenFlg}
        setCoverOpenFlg={setCoverOpenFlg}
      />
    </div>
  );
}
