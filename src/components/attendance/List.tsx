"use client";

import { isHoliday } from "@holiday-jp/holiday_jp";
import { TypeAttendanceItem, TypeMonthlyAttendance } from "@/types/attendance";
import dayjs from "@/lib/dayjs";
import React, {
  CSSProperties,
  Dispatch,
  useCallback,
  useEffect,
  useState,
} from "react";
import { KeyedMutator } from "swr";
import {
  ApprovalStatusAttendance,
  FixedHoliday,
  AbsentData,
  WorkStyle,
} from "@/lib/constants";
import { getAbsentDataKey, getWorkStyleKey } from "@/utils/constantsUtil";
import { checkAttendanceInput } from "@/utils/checkAttendance";
import styles from "@/styles/Attendance.module.css";
import AllEntry from "@/components/attendance/AllEntry";
import ModalEntry from "./ModalEntry";
import { Employee } from "@prisma/client";
import type { WorkStyleKeys } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  employee: Employee;
  attendanceData: TypeMonthlyAttendance;
  mutateAttendance: KeyedMutator<TypeMonthlyAttendance> | null; // 閲覧モード時はnull
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
  attendanceData,
  mutateAttendance,
  editable,
  setInputCheck,
}: Props) {
  const [entryModalOpenFlg, setEntryModalOpenFlg] = useState<boolean>(false);
  const [entryItem, setEntryItem] = useState<TypeAttendanceItem | null>(null);

  // useEffect
  useEffect(() => {
    if (attendanceData.list && editable) {
      setInputCheck!("");
    }
  }, [setInputCheck, attendanceData, editable]);

  // 入力モーダルを開く
  const handleEntry = (item: TypeAttendanceItem) => {
    setEntryItem(item);
    setEntryModalOpenFlg(true);
  };

  // 入力モーダルを閉じる
  const handleEntryModalClose = useCallback(() => {
    mutateAttendance!();
    setEntryModalOpenFlg(false);
  }, [mutateAttendance, setEntryModalOpenFlg]);

  /** 月末までのカレンダー形式のリストHTMLを作成 */
  // HTMLを格納する変数
  const itemListHTML = [];
  // 月初日
  const startDate = dayjs(`${attendanceData.yearMonth}01`, "YYYYMMDD");
  // 月末日
  const endDate = startDate.endOf("month");
  // 登録済の勤務表データ
  const attendanceList = attendanceData.list ?? [];
  // 承認状況
  const { approvalStatus } = attendanceData;

  // 当月の日数分処理
  for (let date = startDate; date <= endDate; date = date.add(1, "day")) {
    // 登録済データが存在する場合は取得
    const entryData = attendanceList.find(
      (row) => row.key === date.format("YYYYMMDD")
    );

    // 各日付ごとのアイテムを作成
    const item: TypeAttendanceItem = {
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

    const checkDRtInput = checkAttendanceInput(entryData);

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
      approvalStatus === ApprovalStatusAttendance.unapproved.code ||
      approvalStatus === ApprovalStatusAttendance.input.code ||
      approvalStatus === ApprovalStatusAttendance.reinput.code
    ) {
      button = (
        <Button className="w-full" onClick={() => handleEntry(item)}>
          {item.mday}
        </Button>
      );
    } else {
      button = <div>{item.mday}</div>;
    }

    {
      itemListHTML.push(
        <TableRow key={item.date} className={styles.tableRow}>
          <TableCell className={styles.tdDay} style={styleBackGround}>
            {editable ? button : item.mday}
          </TableCell>
          <TableCell style={stylefbColor}>{item.wday}</TableCell>
          <TableCell style={styleBackGround}>{item.startTime}</TableCell>
          <TableCell style={styleBackGround}>{item.endTime}</TableCell>
          <TableCell style={styleBackGround}>{item.rest}</TableCell>
          <TableCell style={styleBackGround}>{item.active}</TableCell>
          <TableCell style={styleBackGround}>{item.overTime}</TableCell>
          <TableCell style={styleBackGround}>{item.lNOverTime}</TableCell>
          <TableCell style={styleBackGround}>{item.legalHolActive}</TableCell>
          <TableCell style={styleBackGround}>
            {WorkStyle[item.workStyle as WorkStyleKeys].mean}
          </TableCell>
          <TableCell style={styleBackGround}>{item.absent}</TableCell>
          <TableCell style={styleBackGround}>{item.note}</TableCell>
        </TableRow>
      );
    }
  }

  return (
    <>
      {editable &&
        (approvalStatus === ApprovalStatusAttendance.unapproved.code ||
          approvalStatus === ApprovalStatusAttendance.input.code) && (
          <AllEntry
            employee={employee}
            attendanceData={attendanceData}
            mutateAttendance={mutateAttendance!}
          />
        )}
      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow className={styles.tableHeader}>
              <TableHead
                className={styles.thDay}
                style={{ minWidth: 50, width: 50 }}
              >
                日付
              </TableHead>
              <TableHead style={{ minWidth: 60, width: 60 }}>曜日</TableHead>
              <TableHead style={{ minWidth: 70, width: 70 }}>開始</TableHead>
              <TableHead style={{ minWidth: 70, width: 70 }}>終了</TableHead>
              <TableHead style={{ minWidth: 70, width: 70 }}>休憩</TableHead>
              <TableHead style={{ minWidth: 70, width: 70 }}>実働</TableHead>
              <TableHead style={{ minWidth: 70, width: 70 }}>残業</TableHead>
              <TableHead style={{ minWidth: 85, width: 85 }}>
                深夜残業
              </TableHead>
              <TableHead style={{ minWidth: 85, width: 85 }}>
                法定休日
              </TableHead>
              <TableHead style={{ minWidth: 90, width: 90 }}>形態</TableHead>
              <TableHead style={{ minWidth: 100, width: 100 }}>区分</TableHead>
              <TableHead style={{ minWidth: 260, width: 260 }}>備考</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{itemListHTML}</TableBody>
        </Table>
      </div>
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
