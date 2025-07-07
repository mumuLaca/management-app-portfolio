"use client";

import { isHoliday } from "@holiday-jp/holiday_jp";
import { TypeDailyItem, TypeMonthlyDailyReport } from "@/types/daily";
import dayjs from "@/lib/dayjs";
import React, {
  CSSProperties,
  Dispatch,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Container } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { KeyedMutator } from "swr";
import {
  ApprovalStatusDailyReport,
  FixedHoliday,
  AbsentData,
  WorkStyle,
} from "@/lib/constants";
import { getAbsentDataKey, getWorkStyleKey } from "@/utils/constantsUtil";
import { checkDailyReportInput } from "@/utils/checkDailyReport";
import styles from "@/styles/Daily.module.css";
import AllEntry from "@/components/daily/AllEntry";
import ModalEntry from "./ModalEntry";
import { Employee } from "@prisma/client";

type Props = {
  employee: Employee;
  dailyReportData: TypeMonthlyDailyReport;
  mutateDailyReport: KeyedMutator<TypeMonthlyDailyReport> | null; // 閲覧モード時はnull
  editable: boolean;
  setInputCheck: Dispatch<React.SetStateAction<string>> | null; // 閲覧モード時はnull
};

/**
 * @description
 * 勤務表_リスト
 *
 * 勤務表入力エリア
 * 管理画面で参照用にも使用
 */
export default function List({
  employee,
  dailyReportData,
  mutateDailyReport,
  editable,
  setInputCheck,
}: Props) {
  const [entryModalOpenFlg, setEntryModalOpenFlg] = useState<boolean>(false);
  const [entryItem, setEntryItem] = useState<TypeDailyItem | null>(null);

  // useEffect
  useEffect(() => {
    if (dailyReportData.list && editable) {
      setInputCheck!("");
    }
  }, [setInputCheck, dailyReportData, editable]);

  // 入力モーダルを開く
  const handleEntry = (item: TypeDailyItem) => {
    setEntryItem(item);
    setEntryModalOpenFlg(true);
  };

  // 入力モーダルを閉じる
  const handleEntryModalClose = useCallback(() => {
    mutateDailyReport!();
    setEntryModalOpenFlg(false);
  }, [mutateDailyReport, setEntryModalOpenFlg]);

  /** 月末までのカレンダー形式のリストHTMLを作成 */
  // HTMLを格納する変数
  const itemListHTML = [];
  // 月初日
  const startDate = dayjs(`${dailyReportData.yearMonth}01`, "YYYYMMDD");
  // 月末日
  const endDate = startDate.endOf("month");
  // 登録済の勤務表データ
  const dailyReportList = dailyReportData.list ?? [];
  // 承認状況
  const { approvalStatus } = dailyReportData;

  // 当月の日数分処理
  for (let date = startDate; date <= endDate; date = date.add(1, "day")) {
    // 登録済データが存在する場合は取得
    const entryData = dailyReportList.find(
      (row) => row.key === date.format("YYYYMMDD")
    );

    // 各日付ごとのアイテムを作成
    const item: TypeDailyItem = {
      date: date.format("YYYY-MM-DD"),
      mday: date.format("D"), // 日付(日)
      wday: date.format("ddd"), // 曜日
      holiday: isHoliday(date.toDate()), // 年末年始については別途検討要
      fixedHoliday: FixedHoliday.includes(date.format("MM-DD")), // 年末年始暫定対応
      saturday: date.day() === 6, // 土曜日であるか
      sunday: date.day() === 0, // 日曜日であるか
      startTime: entryData?.startTime
        ? dayjs.utc(entryData.startTime).format("HH:mm")
        : "", // 勤務開始時間
      endTime: entryData?.endTime
        ? dayjs.utc(entryData.endTime).format("HH:mm")
        : "", // 勤務終了時間
      rest:
        entryData && entryData.rest != null && entryData.rest != undefined
          ? entryData.rest.toFixed(2)
          : "", // 休憩時間
      active: entryData?.activeTime?.toFixed(2) || "", // 実働時間
      overTime: entryData?.overTime?.toFixed(2) || "", // 残業時間
      lNOverTime: entryData?.lNOverTime?.toFixed(2) || "", // 深夜残業時間
      legalHolActive: entryData?.legalHolActive?.toFixed(2) || "", // 法定休日勤務時間
      workStyle: getWorkStyleKey(entryData?.workStyle ?? ""), // 勤務形態
      absentCode: entryData?.absentCode || "", // 区分（コード値）
      absent: AbsentData[getAbsentDataKey(entryData?.absentCode ?? "")].caption, // 区分
      note: entryData?.note || "", // 備考
      empty: !entryData, // 未入力の場合
    };

    const styleBackGround: CSSProperties = {};
    const styleFont: CSSProperties = {};

    // 休日の色付け
    if (AbsentData[getAbsentDataKey(item.absentCode)].allday) {
      styleBackGround.backgroundColor = `rgba(222, 241, 222, 1)`;
      styleFont.color = `rgb(92, 184, 92)`;
    } else if (
      AbsentData[getAbsentDataKey(item.absentCode)].code ===
      AbsentData.companyEvent.code
    ) {
      styleBackGround.backgroundColor = `rgba(255, 220, 177, 1)`;
      styleFont.color = `rgb(255, 127, 0)`;
    } else if (item.saturday) {
      styleBackGround.backgroundColor = `rgba(231, 240, 255, 1)`;
      styleFont.color = `rgb(13, 110, 253)`;
    } else if (item.sunday || item.holiday || item.fixedHoliday) {
      styleBackGround.backgroundColor = `rgba(251, 232, 234, 1)`;
      styleFont.color = `rgb(230, 30, 20)`;
    } else {
      styleBackGround.backgroundColor = `rgba(255, 255, 255, 1)`;
    }

    const checkDRtInput = checkDailyReportInput(entryData);

    // 勤務表の入力チェック
    if (checkDRtInput && editable) {
      setInputCheck!(checkDRtInput);
      styleBackGround.backgroundColor = `rgba(255, 127, 126, 1)`;
    }

    const stylefbColor = {
      ...styleFont,
      ...styleBackGround,
    };

    let button = <></>;

    // 承認状況が「未入力」「入力中」「差戻中」の場合にデータ登録ボタンを有効化
    if (
      approvalStatus === ApprovalStatusDailyReport.unapproved.code ||
      approvalStatus === ApprovalStatusDailyReport.input.code ||
      approvalStatus === ApprovalStatusDailyReport.reinput.code
    ) {
      button = (
        <Button
          variant="primary"
          className="w-100"
          onClick={() => handleEntry(item)}
        >
          {item.mday}
        </Button>
      );
    } else {
      button = <div>{item.mday}</div>;
    }

    {
      itemListHTML.push(
        <tr key={item.date} className={styles.tableRow}>
          <td className={styles.tdDay} style={styleBackGround}>
            {editable ? button : item.mday}
          </td>
          <td style={stylefbColor}>{item.wday}</td>
          <td style={styleBackGround}>{item.startTime}</td>
          <td style={styleBackGround}>{item.endTime}</td>
          <td style={styleBackGround}>{item.rest}</td>
          <td style={styleBackGround}>{item.active}</td>
          <td style={styleBackGround}>{item.overTime}</td>
          <td style={styleBackGround}>{item.lNOverTime}</td>
          <td style={styleBackGround}>{item.legalHolActive}</td>
          <td style={styleBackGround}>{WorkStyle[item.workStyle].mean}</td>
          <td style={styleBackGround}>{item.absent}</td>
          <td style={styleBackGround}>{item.note}</td>
        </tr>
      );
    }
  }

  return (
    <>
      {editable &&
        (approvalStatus === ApprovalStatusDailyReport.unapproved.code ||
          approvalStatus === ApprovalStatusDailyReport.input.code) && (
          <AllEntry
            employee={employee}
            dailyReportData={dailyReportData}
            mutateDailyReport={mutateDailyReport!}
          />
        )}
      <Container fluid className={styles.tableContainer}>
        <Table responsive>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.thDay} style={{ minWidth: 50, width: 50 }}>
                日付
              </th>
              <th style={{ minWidth: 60, width: 60 }}>曜日</th>
              <th style={{ minWidth: 70, width: 70 }}>開始</th>
              <th style={{ minWidth: 70, width: 70 }}>終了</th>
              <th style={{ minWidth: 70, width: 70 }}>休憩</th>
              <th style={{ minWidth: 70, width: 70 }}>実働</th>
              <th style={{ minWidth: 70, width: 70 }}>残業</th>
              <th style={{ minWidth: 85, width: 85 }}>深夜残業</th>
              <th style={{ minWidth: 85, width: 85 }}>法定休日</th>
              <th style={{ minWidth: 90, width: 90 }}>形態</th>
              <th style={{ minWidth: 100, width: 100 }}>区分</th>
              <th style={{ minWidth: 260, width: 260 }}>備考</th>
            </tr>
          </thead>
          <tbody>{itemListHTML}</tbody>
        </Table>
      </Container>
      <ModalEntry
        entryModalOpenFlg={entryModalOpenFlg}
        setEntryModalOpenFlg={setEntryModalOpenFlg}
        entryModalCloseFunction={handleEntryModalClose}
        entryItem={entryItem}
        employee={employee}
      />
    </>
  );
}
