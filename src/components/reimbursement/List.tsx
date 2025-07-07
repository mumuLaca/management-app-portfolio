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
} from "@/lib/constants";
import { useWindowSize } from "@/lib/useWindowSize";
import styles from "@/styles/Reimbursement.module.css";
import ModalEntry from "./ModalEntry";
import { Employee } from "@prisma/client";
import { TypeMonthlyReimbursement } from "@/types/reimbursement";
import { BsPlusCircle } from "react-icons/bs";

export type PatternEntryData = {
  employeeId: number;
  tno?: number;
  date?: Date | null;
  contents: string;
  invoiceFlg?: boolean;
  paidTo: string;
  cost: number;
  note: string | null;
  entryFlg?: string;
  yearMonth?: string;
};

type Props = {
  employee: Employee;
  reimbursementData: TypeMonthlyReimbursement;
  mutateSettlement: KeyedMutator<TypeMonthlyReimbursement> | null; // 閲覧モード時はnull
  editable: boolean;
  setInputCheck: Dispatch<React.SetStateAction<string>> | null; // 閲覧モード時はnull
};

/**
 * @description
 * 立替精算表_リスト
 *
 * 立替精算表出力エリア
 * 管理画面で参照用にも使用
 */
export default function List({
  employee,
  reimbursementData,
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
    if (reimbursementData.list && editable) {
      // 承認状況をセット
      mutateSettlement!();
      // チェックステータスをセット
      setInputCheck!("");
    }
  }, [reimbursementData, editable, setInputCheck, mutateSettlement]);

  /** ユーザーが編集可能かどうかを判定 */
  const isUserEditable = () => {
    // 承認状況が「申請なし」「入力中」「差戻中」の場合は編集可能とする
    return [
      ApprovalStatusSettlement.noInput.code,
      ApprovalStatusSettlement.input.code,
      ApprovalStatusSettlement.reinput.code,
    ].includes(reimbursementData.approvalStatus);
  };

  /** 入力モーダルを開く(登録) */
  const handleEntry = useCallback(() => {
    setEntryItem({
      employeeId: employee.id,
      date: null,
      contents: "",
      invoiceFlg: true,
      paidTo: "",
      cost: 0,
      note: "",
      yearMonth: reimbursementData.yearMonth,
      entryFlg: EntryFlg.entry,
    });
    setEntryModalOpenFlg(true);
  }, [reimbursementData, employee, setEntryItem, setEntryModalOpenFlg]);

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

  /** 登録済のデータからリストHTMLを作成 */
  // HTMLを格納する変数
  const itemListHTML = [];
  const reimbursementList = reimbursementData?.list ?? [];

  for (const input of reimbursementList) {
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
      contents: input?.contents || "", // 内容
      paidTo: input?.paidTo || "", // 支払先
      cost: String(input?.cost)?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "", // 金額
      invoiceFlg: input?.invoiceFlg ? "有り" : "無し", // インボイス登録番号
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
        <td style={styleBackGround}>{item.contents}</td>
        <td style={styleBackGround}>{item.paidTo}</td>
        <td style={styleBackGround}>
          {item.cost}
          <span>円</span>
        </td>
        <td style={styleBackGround}>{item.invoiceFlg}</td>
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
      {!reimbursementList?.length ? (
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
                <th
                  style={{ minWidth: 50, width: 50 }}
                  className={styles.thDay}
                >
                  日付
                </th>
                <th style={{ minWidth: 50, width: 50 }}>曜日</th>
                {editable && isUserEditable() && (
                  <th style={{ minWidth: 70, width: 70 }}>修正</th>
                )}
                <th style={{ minWidth: 150, width: 150 }}>内容</th>
                <th style={{ minWidth: 200, width: 200 }}>支払先</th>
                <th style={{ minWidth: 120, width: 120 }}>小計</th>
                <th style={{ minWidth: 110, width: 110 }}>
                  インボイス登録番号
                </th>
                <th style={{ minWidth: 250, width: 250 }}>備考</th>
              </tr>
            </thead>
            <tbody>{itemListHTML}</tbody>
          </Table>
        </Container>
      )}
      <ModalEntry
        entryModalOpenFlg={entryModalOpenFlg}
        entryModalCloseFunction={handleEntryModalClose}
        entryData={entryItem}
        employee={employee}
      />
    </>
  );
}
