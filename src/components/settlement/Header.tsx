"use client";

import { ApprovalStatusSettlement, SettlementForm } from "@/lib/constants";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
} from "react";
import {
  Accordion,
  Alert,
  Col,
  Container,
  Dropdown,
  Form,
  Row,
} from "react-bootstrap";
import ModalConfirm from "@/components/modal/ModalConfirm";
import { MODALMESSAGE } from "@/lib/modalMessage";
import { useWindowSize } from "@/lib/useWindowSize";
import { setCookie } from "cookies-next";
import { TypeMonthlySettlement } from "@/types/settlement";
import { Employee } from "@prisma/client";
import { MESSAGE } from "@/lib/message";

interface Props {
  employee: Employee; // 社員情報
  settlementData: TypeMonthlySettlement; // 旅費精算データ
  yearMonth: string; // 年月
  setTargetyearMonth: Dispatch<SetStateAction<string>> | null; // 年月のusestate
  editable: boolean; // 編集可否
  inputCheck: string; // 入力エラー情報
}

// useContext
const HeaderContext = createContext(
  {} as {
    employee: Employee;
    settlementData: TypeMonthlySettlement;
    yearMonth: string;
    setTargetyearMonth: Dispatch<SetStateAction<string>> | null;
    editable: boolean;
    inputCheck: string;
    width: number;
  }
);

/**
 * @description
 * 旅費精算表_ヘッダー
 *
 * 日付情報や精算金額を表示
 */
export default function Header({
  employee,
  settlementData,
  yearMonth,
  setTargetyearMonth,
  editable,
  inputCheck,
}: Props) {
  const [width] = useWindowSize();

  return (
    <>
      <HeaderContext.Provider
        value={{
          employee,
          settlementData,
          yearMonth,
          setTargetyearMonth,
          editable,
          inputCheck,
          width,
        }}
      >
        <Container className="mb-1 px-1">
          {editable &&
            settlementData.approvalStatus ===
              ApprovalStatusSettlement.approved.code && (
              <Row className="px-3">
                <Alert variant={MESSAGE.IM0002.kind}>
                  {MESSAGE.IM0002.message}
                </Alert>
              </Row>
            )}
          {editable &&
            settlementData.approvalStatus ===
              ApprovalStatusSettlement.reinput.code && (
              <Row className="px-3">
                <Alert variant={MESSAGE.WM0001.kind}>
                  {MESSAGE.WM0001.message}
                </Alert>
              </Row>
            )}
          {inputCheck && (
            <Row className="px-3">
              <Alert variant={MESSAGE[inputCheck].kind}>
                {MESSAGE[inputCheck].message}
              </Alert>
            </Row>
          )}
          {width < 992 ? (
            <Accordion className="mb-4" defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="w-100 d-flex justify-content-between align-items-center pe-4">
                    <h5>基本情報</h5>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <HeaderDetailComponent />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          ) : (
            <HeaderDetailComponent />
          )}
        </Container>
      </HeaderContext.Provider>
    </>
  );
}

/**
 * @description
 * ヘッダー項目詳細
 *
 * ヘッダーを定義する。
 */
function HeaderDetailComponent() {
  const today = dayjs();
  const lastMonth = dayjs().add(-1, "month");
  const monthsList = [
    { caption: today.format("YYYY年MM月"), value: today.format("YYYYMM") },
    {
      caption: lastMonth.format("YYYY年MM月"),
      value: lastMonth.format("YYYYMM"),
    },
  ];

  // useContextから情報取得
  const {
    employee,
    settlementData,
    yearMonth,
    setTargetyearMonth,
    editable,
    width,
  } = useContext(HeaderContext);

  /** 月末日を算出 */
  const lastDayOfTheMonth = useMemo(
    () => dayjs(yearMonth, "YYYYMM").endOf("month").format("YYYY/MM/DD"),
    [yearMonth]
  );

  /** 合計金額を算出 */
  const calcTotal = useMemo(() => {
    const total = settlementData.list.reduce(
      (sum, row) => sum + (row?.total ?? 0),
      0
    );
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [settlementData.list]);

  /** 精算形態別の合計金額を算出 */
  const calcTotalByForm = useMemo(() => {
    return (settlementForm: string) => {
      const total = settlementData.list
        .filter((row) => row.form === settlementForm)
        .reduce((sum, row) => sum + (row?.total ?? 0), 0);
      return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
  }, [settlementData.list]);

  return (
    <>
      <Row>
        <Col xs={12} sm={12} lg={2} className="mb-2">
          {editable ? (
            <>
              <div className="report-header-title-name">提出期限</div>
              <span className="report-header-title-value">
                {lastDayOfTheMonth}
              </span>
            </>
          ) : (
            <>
              <div className="report-header-title-name">名前</div>
              <span className="report-header-title-value">{employee.name}</span>
            </>
          )}
        </Col>
        <Col xs={12} sm={12} lg={editable ? 6 : 7} className="mb-2">
          <div className="report-header-title-name">合計</div>
          <div
            className={width < 992 ? `ps-3 fs-6 d-flex` : `ps-3 fs-5 d-flex`}
          >
            <span>
              {calcTotal}円&nbsp;
              {width < 576 && <br />}【
              {`${SettlementForm.commuter.method}\u2000:\u2000${calcTotalByForm(
                SettlementForm.commuter.code
              )}円\u2000`}
              {`${SettlementForm.trip.method}\u2000:\u2000${calcTotalByForm(
                SettlementForm.trip.code
              )}円`}
              】
            </span>
          </div>
        </Col>
        {editable ? (
          <>
            <Col xs={6} sm={6} lg={2} className="mb-2">
              <div className="report-header-title-name">ステータス</div>
              <div className="ps-3">
                <ApprovalButton />
              </div>
            </Col>
            <Col xs={6} sm={6} lg={2}>
              <div className="report-header-title-name">入力月</div>
              <div className="d-flex align-items-center">
                <Form.Select
                  onChange={(e) => setTargetyearMonth!(e.target.value)}
                  className="mx-2"
                  value={settlementData.yearMonth || today.format("YYYYMM")}
                >
                  {monthsList.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.caption}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </>
        ) : (
          <Col xs={12} sm={12} lg={3}>
            <div className="report-header-title-name">入力月</div>
            <div className="d-flex align-items-center">
              <div
                className={
                  width < 992 ? `ps-3 fs-6 d-flex` : `ps-3 fs-5 d-flex`
                }
              >
                {dayjs(settlementData.yearMonth).format("YYYY年MM月")}
              </div>
            </div>
          </Col>
        )}
      </Row>
    </>
  );
}

/**
 * @description
 * 承認状況ボタン
 *
 * 承認状況に応じたドロップダウンボタンを定義
 */
function ApprovalButton() {
  const [modalShow, setModalShow] = React.useState(false);

  // useContextから情報取得
  const { employee, settlementData, inputCheck } = useContext(HeaderContext);

  /** 管理本部へ提出 */
  const handleOpenConfirmModal = () => {
    setModalShow(true);
  };

  /** 旅費精算表の承認状況を更新 */
  const handleUpdateApproval = async (approvalStatus: string) => {
    try {
      // 承認状況を更新
      await axios.post("/api/approval/update/settlement", {
        id: employee.id,
        yearMonth: settlementData.yearMonth,
        approve: approvalStatus,
      });

      // 「再申請中」への更新は、slackにも通知する
      if (approvalStatus === ApprovalStatusSettlement.reApprovalPending.code) {
        await axios.post("/api/slack/sendSlackMessageToAdmin", {
          message: `【${dayjs(settlementData.yearMonth).format(
            "YYYY年MM月"
          )}旅費精算表再提出】\n提出者：${
            employee.name
          }\n旅費精算表の修正が完了しました。`,
        });
      }

      // Cookieに表示する年月をセット
      setCookie("targetYearAndMonth", settlementData.yearMonth);
      // 画面更新
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const { approvalStatus } = settlementData;
  let button = <></>;

  // 承認状況 = 未入力（申請なし）
  if (
    !approvalStatus ||
    approvalStatus === ApprovalStatusSettlement.noInput.code
  ) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="secondary" disabled>
          {ApprovalStatusSettlement.noInput.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );

    // 承認状況 = 入力中
  } else if (approvalStatus === ApprovalStatusSettlement.input.code) {
    button = (
      <>
        <Dropdown>
          <Dropdown.Toggle variant={inputCheck ? "secondary" : "info"}>
            {ApprovalStatusSettlement.input.caption}
          </Dropdown.Toggle>
          {!inputCheck && (
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleOpenConfirmModal}>
                管理本部へ提出
              </Dropdown.Item>
            </Dropdown.Menu>
          )}
        </Dropdown>
        <ModalConfirm
          modalMessage={MODALMESSAGE.MM00001}
          show={modalShow}
          setModalShow={setModalShow}
          executeFunction={() =>
            handleUpdateApproval(ApprovalStatusSettlement.approvalPending.code)
          }
        />
      </>
    );

    // 承認状況 = 提出済
  } else if (approvalStatus === ApprovalStatusSettlement.approvalPending.code) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="primary">
          {ApprovalStatusSettlement.approvalPending.caption}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() =>
              handleUpdateApproval(ApprovalStatusSettlement.input.code)
            }
          >
            入力訂正
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    // 承認状況 = 入力ミスにより差戻、再修正中
  } else if (approvalStatus === ApprovalStatusSettlement.reinput.code) {
    button = (
      <>
        <Dropdown>
          <Dropdown.Toggle variant={inputCheck ? "secondary" : "warning"}>
            {ApprovalStatusSettlement.reinput.caption}
          </Dropdown.Toggle>
          {!inputCheck && (
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleOpenConfirmModal}>
                管理本部へ再提出
              </Dropdown.Item>
            </Dropdown.Menu>
          )}
        </Dropdown>

        <ModalConfirm
          modalMessage={MODALMESSAGE.MM00002}
          show={modalShow}
          setModalShow={setModalShow}
          executeFunction={() =>
            handleUpdateApproval(
              ApprovalStatusSettlement.reApprovalPending.code
            )
          }
        />
      </>
    );

    // 承認状況 = 差戻後、再提出
  } else if (
    approvalStatus === ApprovalStatusSettlement.reApprovalPending.code
  ) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="primary" disabled>
          {ApprovalStatusSettlement.reApprovalPending.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );

    // 承認状況 = 管理本部の承認済
  } else if (approvalStatus === ApprovalStatusSettlement.approved.code) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="success" disabled>
          {ApprovalStatusSettlement.approved.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );
  }

  return button;
}
