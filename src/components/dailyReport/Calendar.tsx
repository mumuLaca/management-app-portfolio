import { Dispatch, useEffect, useState } from "react";
import styles from "@/styles/DailyReport.module.css";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";
import dayjs from "dayjs";
import axios from "axios";
import { DailyReportPost } from "@prisma/client";
import { ApprovalStatusDailyReport, DailyReportType } from "@/lib/constants";
import { DailyReportCommonUrlParams } from "@/pages/dailyReport/[...slug]";

type Props = {
  urlParams: DailyReportCommonUrlParams;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  postDataUpdateFlg: boolean;
  setPostDataUpdateFlg: (value: boolean) => void;
  modalTweetInfoOpenFlg?: boolean;
  setModalTweetInfoOpenFlg?: Dispatch<React.SetStateAction<boolean>>;
  coverOpenFlg: boolean;
  setCoverOpenFlg: Dispatch<React.SetStateAction<boolean>>;
};

/**
 * @description
 * カレンダーコンポーネント
 * 日報、週報、月報、四半期報のカレンダーを表示するコンポーネント
 */
export default function Calendar({
  urlParams,
  date,
  setDate,
  postDataUpdateFlg,
  setPostDataUpdateFlg,
  modalTweetInfoOpenFlg,
  setModalTweetInfoOpenFlg,
  coverOpenFlg,
  setCoverOpenFlg,
}: Props) {
  const [entriedPost, setEntriedPost] = useState<DailyReportPost[]>();
  const [moveCalendarFlg, setMoveCalendarFlg] = useState<boolean>(false); // カレンダー移動フラグ

  // URLパラメータから必要な値を取得
  const { roomId, dailyReportType, fromDate, toDate } =
    urlParams as DailyReportCommonUrlParams;

  // 日報データのDB更新を検知して処理実行
  useEffect(() => {
    const updateCalendar = async () => {
      if (postDataUpdateFlg || moveCalendarFlg || modalTweetInfoOpenFlg) {
        await axios
          .get("/api/dailyReport/get/calendarInfo", {
            params: {
              roomId: roomId,
              date: dayjs(date).format("YYYY-MM-DD"),
              dailyReportType: dailyReportType,
            },
          })
          .then((res) => {
            setEntriedPost(res.data);
            setPostDataUpdateFlg(false);
            setMoveCalendarFlg(false);
          });
      }
    };

    updateCalendar();
  }, [
    postDataUpdateFlg,
    moveCalendarFlg,
    modalTweetInfoOpenFlg,
    setPostDataUpdateFlg,
    roomId,
    dailyReportType,
    date,
  ]);

  const getDaysInMonth = (date: Date) => {
    return dayjs(date).daysInMonth();
  };

  /** 月初日の曜日を取得する関数 */
  const getFirstDayOfMonth = (date: Date) => {
    return dayjs(date).startOf("month").day();
  };

  /** 前月に戻る関数 */
  const handlePrevMonth = () => {
    setCoverOpenFlg(false);
    setMoveCalendarFlg(true);
    const urlFromDate = dayjs(fromDate);
    switch (dailyReportType) {
      // 日報
      case DailyReportType.daily.code:
        setDate(dayjs(date).subtract(1, "month").startOf("month").toDate());
        return;
      // 週報
      case DailyReportType.weekly.code:
        let prevStartDatOfMonth = dayjs(date)
          .subtract(1, "month")
          .startOf("month");
        let startDayOfWeek = prevStartDatOfMonth.startOf("week").add(1, "day");
        if (prevStartDatOfMonth.month() === startDayOfWeek.month()) {
          setDate(startDayOfWeek.toDate());
        } else {
          setDate(
            prevStartDatOfMonth
              .add(7, "day")
              .startOf("week")
              .add(1, "day")
              .toDate()
          );
        }
        return;
      // 月報
      case DailyReportType.monthly.code:
        let targetDate = dayjs(date)
          .subtract(1, "year")
          .startOf("month")
          .startOf("day");
        do {
          if (
            targetDate.isBefore(urlFromDate.startOf("month").startOf("day"))
          ) {
            targetDate = targetDate.add(1, "month");
          } else {
            setDate(targetDate.toDate());
            return;
          }
        } while (true);

      // 四半期報
      case DailyReportType.quarter.code:
        let tQDate = dayjs(date)
          .subtract(1, "year")
          .startOf("month")
          .startOf("day");
        do {
          if (tQDate.isBefore(urlFromDate.startOf("month").startOf("day"))) {
            tQDate = tQDate.add(3, "month");
          } else {
            setDate(tQDate.toDate());
            return;
          }
        } while (true);
    }
  };

  /** 次月に進む関数 */
  const handleNextMonth = () => {
    setCoverOpenFlg(false);
    setMoveCalendarFlg(true);
    const urlToDate = dayjs(toDate);
    switch (dailyReportType) {
      // 日報
      case DailyReportType.daily.code:
        setDate(dayjs(date).add(1, "month").startOf("month").toDate());
        return;
      // 週報
      case DailyReportType.weekly.code:
        let nextStartDatOfMonth = dayjs(date).add(1, "month").startOf("month");
        let startDayOfWeek = nextStartDatOfMonth.startOf("week").add(1, "day");
        if (nextStartDatOfMonth.month() === startDayOfWeek.month()) {
          setDate(startDayOfWeek.toDate());
        } else {
          setDate(
            nextStartDatOfMonth
              .add(7, "day")
              .startOf("week")
              .add(1, "day")
              .toDate()
          );
        }
        return;
      // 月報
      case DailyReportType.monthly.code:
        let tMDate = dayjs(date).add(1, "year").startOf("month").startOf("day");

        do {
          if (tMDate.isAfter(urlToDate.startOf("month").startOf("day"))) {
            tMDate = tMDate.subtract(1, "month");
          } else {
            setDate(tMDate.toDate());
            return;
          }
        } while (true);
      // 四半期報
      case DailyReportType.quarter.code:
        let tQDate = dayjs(date).add(1, "year").startOf("month").startOf("day");

        do {
          if (tQDate.isAfter(urlToDate.startOf("month").startOf("day"))) {
            tQDate = tQDate.subtract(1, "month");
          } else {
            setDate(tQDate.toDate());
            return;
          }
        } while (true);
    }
  };

  /** 日付ボタンの色を設定する関数 */
  const setStatusColor = (postDate: Date) => {
    const postData = entriedPost?.find((post) =>
      dayjs(post.date).isSame(postDate, "day")
    );

    if (postData) {
      switch (postData.status) {
        case ApprovalStatusDailyReport.saveTemporary.code:
          return "bg-info";
        case ApprovalStatusDailyReport.submitted.code:
          return styles.statusBgSubmited;
        case ApprovalStatusDailyReport.firstApproval.code:
          return styles.statusBgTrainingPersonApproval;
        case ApprovalStatusDailyReport.secondApproval.code:
          return styles.statusBgHeadOfficeApproval;
        case ApprovalStatusDailyReport.firstPending.code:
        case ApprovalStatusDailyReport.secondPending.code:
          return "bg-warning";
      }
    } else {
      return "";
    }
  };

  /** 日付ボタン作成 */
  const renderCalendar = () => {
    const days = [];
    const urlFromDate = dayjs(fromDate);
    const urlToDate = dayjs(toDate);
    const startOfMonth = dayjs(date).startOf("month");
    const endOfMonth = dayjs(date).endOf("month");

    switch (dailyReportType) {
      // 日報
      case DailyReportType.daily.code:
        const daysInMonth = getDaysInMonth(date);
        const firstDay = getFirstDayOfMonth(date);
        // 空のセルを追加
        for (let i = 0; i < firstDay; i++) {
          days.push(
            <div key={`empty-${i}`} className={styles.calendarCell}></div>
          );
        }
        // 日付を追加
        for (let i = 1; i <= daysInMonth; i++) {
          let statusColor = setStatusColor(dayjs(date).date(i).toDate());

          days.push(
            <button
              key={i}
              className={`${styles.calendarCell} ${statusColor} ${
                i === Number(date.getDate()) && styles.currentDate
              }`}
              onClick={() => {
                setDate(dayjs(date).date(i).toDate());
                closeModal();
              }}
            >
              {i}
            </button>
          );
        }
        break;
      // 週報
      case DailyReportType.weekly.code:
        // カレンダー表示の開始（その週の日曜日）
        const calendarStart = startOfMonth.startOf("week"); // ← Sunday 基準
        const calendarEnd = endOfMonth.endOf("week"); // ← Saturday 基準
        const diffDays = calendarEnd.diff(calendarStart, "day") + 1; // +1 は開始日を含めるため
        let totalWeeks = Math.ceil(diffDays / 7); // 週数を計算
        let week = 0;
        if (calendarStart.add(1, "day").month() === dayjs(date).month()) {
          week = 0;
        } else {
          week = 1;
        }

        // 表紙ボタンを追加
        days.push(
          <button
            key={`cover-${week}`}
            className={`${styles.weekCell} ${
              coverOpenFlg ? styles.currentDate : "bg-dark text-white"
            }`}
            onClick={() => {
              setCoverOpenFlg(true);
              closeModal();
            }}
          >
            月次目標
          </button>
        );

        // 週数分ループ
        for (week; week < totalWeeks; week++) {
          const targetFromDate = calendarStart
            .add(week * 7, "day")
            .add(1, "day");
          const targetToDate = targetFromDate.add(6, "day").subtract(1, "day");

          if (targetFromDate.month() !== dayjs(date).month()) {
            continue;
          }

          let statusColor = setStatusColor(targetFromDate.toDate());

          days.push(
            <button
              key={`week-${week}`}
              className={`${styles.weekCell} ${statusColor} ${
                coverOpenFlg ||
                (targetFromDate.isSame(date, "day") && styles.currentDate)
              }`}
              onClick={() => {
                setCoverOpenFlg(false);
                setDate(targetFromDate.toDate());
                closeModal();
              }}
            >
              {targetFromDate.format("M/D")}〜{targetToDate.format("M/D")}
            </button>
          );
        }

        break;
      // 月報
      case DailyReportType.monthly.code:
        let dMDate = dayjs(date);
        if (dMDate.month() < 3) {
          dMDate = dMDate.subtract(1, "year");
        }
        for (let i = 0; i < 12; i++) {
          const monthIndex = (i + 3) % 12; // 3=4月スタート（0-index）
          const year = i < 9 ? dMDate.year() : dMDate.year() + 1;

          const monthDate = dayjs(new Date(year, monthIndex, 1));

          let statusColor = setStatusColor(monthDate.toDate());

          days.push(
            <button
              key={i}
              className={`${styles.monthlyCell} ${statusColor} ${
                monthDate.month() === dMDate.toDate().getMonth() &&
                styles.currentDate
              }`}
              onClick={() => {
                setDate(monthDate.toDate());
                closeModal();
              }}
              disabled={
                monthDate.isBefore(urlFromDate) || monthDate.isAfter(urlToDate)
              }
            >
              {monthDate.format("M月")}
            </button>
          );
        }
        break;
      // 四半期報
      case DailyReportType.quarter.code:
        let dQDate = dayjs(date);
        if (dQDate.month() < 3) {
          dQDate = dQDate.subtract(1, "year");
        }

        // 表紙ボタンを追加
        days.push(
          <button
            key={`cover-${dQDate.year()}`}
            className={`${styles.quarterlyCell} ${
              coverOpenFlg ? styles.currentDate : "bg-dark text-white"
            }`}
            onClick={() => {
              setCoverOpenFlg(true);
              closeModal();
            }}
          >
            年度目標
          </button>
        );

        for (let i = 1; i <= 4; i++) {
          const monthIndex = (i * 3) % 12; // 3=4月スタート（0-index）
          const year = i * 3 <= 9 ? dQDate.year() : dQDate.year() + 1;
          const quarterDate = dayjs(new Date(year, monthIndex, 1));

          let statusColor = setStatusColor(quarterDate.toDate());

          days.push(
            <button
              key={i}
              className={`${styles.quarterlyCell} ${statusColor} ${
                coverOpenFlg ||
                (quarterDate.isSame(date, "month") && styles.currentDate)
              }`}
              onClick={() => {
                setCoverOpenFlg(false);
                setDate(quarterDate.toDate());
                closeModal();
              }}
              disabled={
                quarterDate.isBefore(urlFromDate) ||
                quarterDate.isAfter(urlToDate)
              }
            >
              {`Q${i} (${quarterDate.format("YYYY/M")} ~ ${quarterDate
                .add(2, "month")
                .format("YYYY/M")})`}
            </button>
          );
        }

        break;
    }

    return days;
  };

  // グリッドタイプを設定する関数
  const setGridType = () => {
    switch (dailyReportType) {
      // 日報, 週報, 四半期報
      case DailyReportType.daily.code:
      case DailyReportType.weekly.code:
      case DailyReportType.quarter.code:
        return styles.Divisions7Grid;
      // 月報
      case DailyReportType.monthly.code:
        return styles.Divisions4Grid;
    }
  };

  // 表示期間を設定する関数
  const setDisplayPeriod = () => {
    switch (dailyReportType) {
      // 日報, 週報
      case DailyReportType.daily.code:
      case DailyReportType.weekly.code:
        return `${date.getFullYear()}年${date.getMonth() + 1}月`;
      // 月報, 四半期報
      case DailyReportType.monthly.code:
      case DailyReportType.quarter.code:
        let displayText = date.getFullYear();
        if (date.getMonth() < 3) {
          displayText = date.getFullYear() - 1;
        }
        return `${displayText}年度`;
    }
  };

  // 前月、前年に戻るボタンの表示制御
  const setDisplayPrevMonth = () => {
    switch (dailyReportType) {
      // 日報, 週報
      case DailyReportType.daily.code:
      case DailyReportType.weekly.code:
        return dayjs(date).format("YYYY-MM") ===
          dayjs(fromDate).format("YYYY-MM")
          ? true
          : false;
      // 月報, 四半期報
      case DailyReportType.monthly.code:
      case DailyReportType.quarter.code:
        const targetDate = dayjs(date);
        const urlFromDate = dayjs(fromDate);
        let april = dayjs(new Date(targetDate.year(), 3, 1)); // 3 = 4月（0-indexなので注意）
        if (targetDate.month() < 3) {
          april = dayjs(new Date(targetDate.year() - 1, 3, 1));
        }

        if (urlFromDate.isBefore(april)) {
          return false;
        }
        return true;
    }
  };

  // 次月、次年に進むボタンの表示制御
  const setDisplayNextMonth = () => {
    switch (dailyReportType) {
      // 日報, 週報
      case DailyReportType.daily.code:
      case DailyReportType.weekly.code:
        return dayjs(date).format("YYYY-MM") === dayjs(toDate).format("YYYY-MM")
          ? true
          : false;
      // 月報, 四半期報
      case DailyReportType.monthly.code:
      case DailyReportType.quarter.code:
        const targetDate = dayjs(date);
        const urlToDate = dayjs(toDate);
        let march = dayjs(new Date(targetDate.year(), 2, 31)); // 2 = 3月（0-indexなので注意）
        if (targetDate.month() > 2) {
          march = dayjs(new Date(targetDate.year() + 1, 2, 31));
        }

        if (urlToDate.isAfter(march)) {
          return false;
        }
        return true;
    }
  };

  // モーダルとして表示している場合、モーダルを閉じる
  const closeModal = () => {
    setTimeout(() => {
      !!modalTweetInfoOpenFlg &&
        setModalTweetInfoOpenFlg &&
        setModalTweetInfoOpenFlg(false);
    }, 400); // 1秒待機
  };

  return (
    <div className={styles.calendarArea}>
      <div className={styles.calendarHeader}>
        <button
          onClick={handlePrevMonth}
          className={styles.calendarButton}
          disabled={setDisplayPrevMonth()}
        >
          <FaArrowAltCircleLeft />
        </button>
        <span className={styles.calendarMonth}>{setDisplayPeriod()}</span>
        <button
          onClick={handleNextMonth}
          className={styles.calendarButton}
          disabled={setDisplayNextMonth()}
        >
          <FaArrowAltCircleRight />
        </button>
      </div>
      <div className={setGridType()}>
        {dailyReportType === DailyReportType.daily.code && (
          <>
            <div key={`dd-${0}`} className={styles.calendarCell}>
              日
            </div>
            <div key={`dd-${1}`} className={styles.calendarCell}>
              月
            </div>
            <div key={`dd-${2}`} className={styles.calendarCell}>
              火
            </div>
            <div key={`dd-${3}`} className={styles.calendarCell}>
              水
            </div>
            <div key={`dd-${4}`} className={styles.calendarCell}>
              木
            </div>
            <div key={`dd-${5}`} className={styles.calendarCell}>
              金
            </div>
            <div key={`dd-${6}`} className={styles.calendarCell}>
              土
            </div>
          </>
        )}
        {renderCalendar()}
      </div>
      <div className={styles.colorDescriptionArea}>
        <div>
          <span className={`${styles.colorSquare} bg-info`}></span>
          <span className={styles.colorDescription}>...一時保存中</span>
        </div>
        <div>
          <span
            className={`${styles.colorSquare} ${styles.statusBgSubmited}`}
          ></span>
          <span className={styles.colorDescription}>...提出済</span>
        </div>
        <div>
          <span
            className={`${styles.colorSquare} ${styles.statusBgTrainingPersonApproval}`}
          ></span>
          <span className={styles.colorDescription}>...育成担当者承認済</span>
        </div>
        <div>
          <span
            className={`${styles.colorSquare} ${styles.statusBgHeadOfficeApproval}`}
          ></span>
          <span className={styles.colorDescription}>...本社承認済</span>
        </div>
        <div>
          <span className={`${styles.colorSquare} bg-warning`}></span>
          <span className={styles.colorDescription}>...差戻中(指摘有)</span>
        </div>
      </div>
    </div>
  );
}
