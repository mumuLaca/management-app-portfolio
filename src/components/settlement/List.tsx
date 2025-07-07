"use client";

import { isHoliday } from "@holiday-jp/holiday_jp";
import dayjs from "@/lib/dayjs";
import {
  CSSProperties,
  Dispatch,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { KeyedMutator } from "swr";
import {
  ApprovalStatusSettlement,
  EntryFlg,
  FixedHoliday,
  SettlementForm,
  TravelMethod,
} from "@/lib/constants";
import { useWindowSize } from "@/lib/useWindowSize";
import styles from "@/styles/Settlement.module.css";
import { TypeMonthlySettlement } from "@/types/settlement";
import ModalEntry from "./ModalEntry";
import { FaPersonWalkingArrowRight } from "react-icons/fa6";
import { FaArrowsTurnToDots } from "react-icons/fa6";
import { GiNightSleep } from "react-icons/gi";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { Employee, Settlement } from "@prisma/client";
import axios from "axios";
import { getSettlementFormKey } from "@/utils/constantsUtil";
import { BsPlusCircle } from "react-icons/bs";

export type PatternEntryData = {
  employeeId: number;
  tno?: number;
  displayNo?: number;
  date?: Date | null;
  form: string;
  method: string;
  departure: string;
  arrival: string | null;
  transportation: string | null;
  cost: number;
  note: string | null;
  entryFlg?: string;
  yearMonth?: string;
};

type Props = {
  employee: Employee;
  settlementData: TypeMonthlySettlement;
  mutateSettlement: KeyedMutator<TypeMonthlySettlement> | null; // 閲覧モード時はnull
  editable: boolean;
  setInputCheck: Dispatch<React.SetStateAction<string>> | null; // 閲覧モード時はnull
};

/**
 * @description
 * 旅費精算表_リスト
 *
 * 旅費精算表出力エリア
 * 管理画面で参照用にも使用
 */
export default function List({
  employee,
  settlementData,
  mutateSettlement,
  editable,
  setInputCheck,
}: Props) {
  const [entryModalOpenFlg, setEntryModalOpenFlg] = useState<boolean>(false);
  const [entryItem, setEntryItem] = useState<PatternEntryData | null>(null);
  const [width] = useWindowSize();

  // useEffect
  useEffect(() => {
    // 編集モードの時のみ実行
    if (settlementData.list && editable) {
      // 承認状況をセット
      mutateSettlement!();
      // チェックステータスをセット
      setInputCheck!("");
    }
  }, [settlementData, editable, setInputCheck, mutateSettlement]);

  /** ユーザーが編集可能かどうかを判定 */
  const isUserEditable = () => {
    // 承認状況が「申請なし」「入力中」「差戻中」の場合は編集可能とする
    return [
      ApprovalStatusSettlement.noInput.code,
      ApprovalStatusSettlement.input.code,
      ApprovalStatusSettlement.reinput.code,
    ].includes(settlementData.approvalStatus);
  };

  /** 入力モーダルを開く(登録) */
  const handleEntry = useCallback(() => {
    setEntryItem({
      employeeId: employee.id,
      date: null,
      form: SettlementForm.trip.code,
      method: TravelMethod.oneWay.code,
      departure: "",
      arrival: "",
      transportation: "",
      cost: 0,
      note: "",
      yearMonth: settlementData.yearMonth,
      entryFlg: EntryFlg.entry,
    });
    setEntryModalOpenFlg(true);
  }, [settlementData, employee, setEntryItem, setEntryModalOpenFlg]);

  /** 入力モーダルを開く(更新) */
  const handleUpdate = (item: PatternEntryData) => {
    item!.entryFlg = EntryFlg.update;
    setEntryItem(item);
    setEntryModalOpenFlg(true);
  };

  /** 入力モーダルを閉じる */
  const handleEntryModalClose = useCallback(() => {
    mutateSettlement!();
    setEntryModalOpenFlg(false);
  }, [mutateSettlement, setEntryModalOpenFlg]);

  /** 「移動/宿泊」表示用 */
  const dispTravelMethod = (method: string): React.ReactNode => {
    switch (method) {
      // 移動（片道）
      case TravelMethod.oneWay.code:
        return (
          <>
            {TravelMethod.oneWay.method}
            <FaPersonWalkingArrowRight className="text-primary fs-4" />
          </>
        );
      // 移動（往復）
      case TravelMethod.roundTrip.code:
        return (
          <>
            {TravelMethod.roundTrip.method}
            <FaArrowsTurnToDots className="text-success fs-5" />
          </>
        );
      // 宿泊
      case TravelMethod.stay.code:
        return (
          <>
            {TravelMethod.stay.method}
            <GiNightSleep className="ms-1 text-dark fs-5" />
          </>
        );
      default:
        return <></>;
    }
  };

  /** 登録済のデータからリストHTMLを作成 */
  // HTMLを格納する変数
  const itemListHTML = [];
  const settlementList = settlementData?.list ?? [];

  for (const input of settlementList) {
    const today = dayjs(input.date, "YYYY-MM-DD");

    // リストデータの設定
    const item = {
      tno: input.tno, // 通番
      mday: today.format("D"), // 日付
      wday: today.format("ddd"), // 曜日
      holiday: isHoliday(today.toDate()), // 休日判定
      fixedHoliday: FixedHoliday.includes(today.format("MM-DD")), // 年末年始休暇
      saturday: today.day() === 6, // 土曜判定
      sunday: today.day() === 0, // 日曜判定
      method: dispTravelMethod(input?.method), // 移動/宿泊
      departure: input?.departure || "", // 発駅/宿泊地
      arrival: input?.arrival || "", // 着駅
      transportation: input?.transportation || "", // 交通機関
      cost: String(input?.cost)?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "", // 片道交通費/宿泊費
      total: String(input?.total)?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "", // 小計
      stForm: SettlementForm[getSettlementFormKey(input?.form)].method, // 精算形態
      note: input?.note || "", // 備考
    };

    // 休日・祝日・社用日など特殊日付のレイアウト
    const styleBackGround: CSSProperties = {};
    const styleFont: CSSProperties = {};

    if (item.saturday) {
      styleBackGround.backgroundColor = `rgba(231, 240, 255, 1)`;
      styleFont.color = `rgb(13, 110, 253)`;
    } else if (item.sunday || item.holiday || item.fixedHoliday) {
      styleBackGround.backgroundColor = `rgba(251, 232, 234, 1)`;
      styleFont.color = `rgb(230, 30, 20)`;
    } else {
      styleBackGround.backgroundColor = `rgba(255, 255, 255, 1)`;
    }

    const stylefbColor = {
      ...styleFont,
      ...styleBackGround,
    };
    const styleNote = {
      maxWidth: "300px",
      ...styleBackGround,
    };

    // 一覧のHTMLを作成
    itemListHTML.push(
      <tr key={item.tno} style={styleBackGround}>
        {editable && isUserEditable() && (
          <td className={styles.tdDay} style={styleBackGround}>
            <ButtonChangeOrder
              lintItem={input}
              settlementData={settlementData}
              mutateSettlement={mutateSettlement!}
            />
          </td>
        )}
        <td className={styles.tdDay} style={styleBackGround}>
          {item.mday}
        </td>
        <td style={stylefbColor}>{item.wday}</td>
        {editable && isUserEditable() && (
          <td style={styleBackGround}>
            <Button
              variant="success"
              size="sm"
              onClick={() => handleUpdate(input)}
            >
              修正
            </Button>
          </td>
        )}
        <td style={styleBackGround}>{item.method}</td>
        <td style={styleBackGround}>{item.departure}</td>
        <td style={styleBackGround}>{item.arrival}</td>
        <td style={styleBackGround}>{item.transportation}</td>
        <td style={styleBackGround}>
          {item.cost}
          <span>円</span>
        </td>
        <td style={styleBackGround}>
          {item.total}
          <span>円</span>
        </td>
        <td style={styleBackGround}>{item.stForm}</td>
        <td style={styleNote}>{item.note}</td>
      </tr>
    );
  }

  return (
    <>
      {editable && isUserEditable() && (
        <Container className="my-4 px-5">
          <Row>
            <Col
              xs={12}
              sm={12}
              lg={12}
              className="d-flex justify-content-center"
            >
              <Button
                onClick={() => handleEntry()}
                variant="primary"
                className="d-flex align-items-center justify-content-center"
                style={width < 992 ? { width: "100%" } : { width: "50%" }}
              >
                <BsPlusCircle />
                <span className="ps-2">登録</span>
              </Button>
            </Col>
          </Row>
        </Container>
      )}
      {!settlementList?.length ? (
        <div className="w-100 mt-5 text-center align-items-center fs-5">
          データの登録がありません。
          <br />
          ※未登録の場合は提出不要です。
        </div>
      ) : (
        <Container fluid className={styles.tableContainer}>
          <Table responsive striped>
            <thead>
              <tr className={styles.tableHeader}>
                {editable && isUserEditable() && (
                  <th
                    style={{ minWidth: 30, width: 30, maxWidth: 60 }}
                    className={styles.thDay}
                  >
                    #
                  </th>
                )}
                <th
                  style={{ minWidth: 60, width: 60 }}
                  className={styles.thDay}
                >
                  日付
                </th>
                <th style={{ minWidth: 50, width: 50 }}>曜日</th>
                {editable && isUserEditable() && (
                  <th style={{ minWidth: 70, width: 70 }}>修正</th>
                )}
                <th style={{ minWidth: 140, width: 140 }}>移動/宿泊</th>
                <th style={{ minWidth: 120, width: 120 }}>発駅/宿泊地</th>
                <th style={{ minWidth: 120, width: 120 }}>着駅</th>
                <th style={{ minWidth: 120, width: 120 }}>交通機関</th>
                <th style={{ minWidth: 170, width: 170 }}>片道交通費/宿泊費</th>
                <th style={{ minWidth: 100, width: 100 }}>小計</th>
                <th style={{ minWidth: 100, width: 100 }}>区分</th>
                <th style={{ minWidth: 250, width: 250 }}>備考</th>
              </tr>
            </thead>
            <tbody>{itemListHTML}</tbody>
          </Table>
        </Container>
      )}
      <ModalEntry
        entryModalOpenFlg={entryModalOpenFlg}
        setEntryModalOpenFlg={setEntryModalOpenFlg}
        entryModalCloseFunction={handleEntryModalClose}
        entryData={entryItem}
        employee={employee}
      />
    </>
  );
}

/**
 * @description
 * 順序入替ボタン
 */
function ButtonChangeOrder({
  lintItem,
  settlementData,
  mutateSettlement,
}: {
  lintItem: Settlement;
  settlementData: TypeMonthlySettlement;
  mutateSettlement: KeyedMutator<TypeMonthlySettlement>;
}) {
  /** レコードを前に入替可能か */
  const existPreviousRecord = useCallback(() => {
    // 現在のレコードの一つ前に同日日付のレコードが存在するか
    return settlementData.list
      .filter((obj) => obj.date === lintItem.date)
      .some((obj) => obj.displayNo === lintItem.displayNo - 1);
  }, [settlementData.list, lintItem]);

  /** レコードを後に入替可能か */
  const existLaterRecord = useCallback(() => {
    // 現在のレコードの一つ前に同日日付のレコードが存在するか
    return settlementData.list
      .filter((obj) => obj.date === lintItem.date)
      .some((obj) => obj.displayNo === lintItem.displayNo + 1);
  }, [settlementData.list, lintItem]);

  /** リストの順番を入れ替える(同日のみ) */
  const handleChangeOrder = async (orderType: string) => {
    // 入れ替えるレコードを取得
    const changeLineItem = settlementData.list.find((obj) => {
      if (orderType === "1") {
        // 上のレコードと順番を入れ替える場合、
        return (
          obj.date === lintItem.date && obj.displayNo === lintItem.displayNo - 1
        );
      } else if (orderType === "2") {
        // 下のレコードと順番を入れ替える場合
        return (
          obj.date === lintItem.date && obj.displayNo === lintItem.displayNo + 1
        );
      }
    });

    // API実行
    await axios.post("/api/settlement/update/order", {
      changeItems: [lintItem, changeLineItem],
    });

    // 画面の更新
    mutateSettlement();
  };

  return (
    <div className="fs-5 d-flex align-items-center justify-content-center">
      {existPreviousRecord() && (
        <FaArrowAltCircleUp
          className="mx-1 text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => handleChangeOrder("1")}
        />
      )}
      {existLaterRecord() && (
        <FaArrowAltCircleDown
          className="mx-1 text-danger"
          style={{ cursor: "pointer" }}
          onClick={() => handleChangeOrder("2")}
        />
      )}
    </div>
  );
}
