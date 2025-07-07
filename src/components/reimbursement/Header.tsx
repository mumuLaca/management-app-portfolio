"use client";

import { ApprovalStatusReimbursement } from "@/lib/constants";
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
import { Employee } from "@prisma/client";
import { MESSAGE } from "@/lib/message";
import { TypeMonthlyReimbursement } from "@/types/reimbursement";
import { editComma } from "@/utils/commonUtil";

interface Props {
  employee: Employee; // 社員情報
  reimbursementData: TypeMonthlyReimbursement; // 立替精算データ
  yearMonth: string; // 年月
  setTargetyearMonth: Dispatch<SetStateAction<string>> | null; // 年月のusestate
  editable: boolean; // 編集可否
  inputCheck: string; // 入力エラー情報
}

// useContext
const HeaderContext = createContext(
  {} as {
    employee: Employee;
    reimbursementData: TypeMonthlyReimbursement;
    yearMonth: string;
    setTargetyearMonth: Dispatch<SetStateAction<string>> | null;
    editable: boolean;
    inputCheck: string;
    width: number;
  }
);

/**
 * @description
 * 立替精算表_ヘッダー
 *
 * 日付情報や精算金額を表示
 */
export default function Header({
  employee,
  reimbursementData,
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
          reimbursementData,
          yearMonth,
          setTargetyearMonth,
          editable,
          inputCheck,
          width,
        }}
      >
        <Container className="mb-1 px-1">
          {editable &&
            reimbursementData.approvalStatus ===
              ApprovalStatusReimbursement.approved.code && (
              <Row className="px-3">
                <Alert variant={MESSAGE.IM0002.kind}>
                  {MESSAGE.IM0002.message}
                </Alert>
              </Row>
            )}
          {editable &&
            reimbursementData.approvalStatus ===
              ApprovalStatusReimbursement.reinput.code && (
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
    reimbursementData,
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
    const total = reimbursementData.list.reduce(
      (sum, row) => sum + (row?.cost ?? 0),
      0
    );
    return editComma(total);
  }, [reimbursementData.list]);

  return (
    <>
      <Row>
        <Col xs={6} sm={6} lg={2} className="mb-2">
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
        <Col xs={6} sm={6} lg={6} className="mb-2">
          <div className="report-header-title-name">合計</div>
          <div
            className={width < 992 ? `ps-3 fs-6 d-flex` : `ps-3 fs-5 d-flex`}
          >
            <span>{calcTotal}円&nbsp;</span>
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
                  value={reimbursementData.yearMonth || today.format("YYYYMM")}
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
                {dayjs(reimbursementData.yearMonth).format("YYYY年MM月")}
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
  const { employee, reimbursementData, inputCheck } = useContext(HeaderContext);

  /** 管理本部へ提出 */
  const handleOpenConfirmModal = () => {
    setModalShow(true);
  };

  /** 立替精算表の承認状況を更新 */
  const handleUpdateApproval = async (approvalStatus: string) => {
    try {
      // 承認状況を更新
      await axios.post("/api/approval/update/reimbursement", {
        id: employee.id,
        yearMonth: reimbursementData.yearMonth,
        approve: approvalStatus,
      });

      // 「再申請中」への更新は、slackにも通知する
      if (
        approvalStatus === ApprovalStatusReimbursement.reApprovalPending.code
      ) {
        await axios.post("/api/slack/sendSlackMessageToAdmin", {
          message: `【${dayjs(reimbursementData.yearMonth).format(
            "YYYY年MM月"
          )}立替精算表再提出】\n提出者：${
            employee.name
          }\n立替精算表の修正が完了しました。`,
        });
      }

      // Cookieに表示する年月をセット
      setCookie("targetYearAndMonth", reimbursementData.yearMonth);
      // 画面更新
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const { approvalStatus } = reimbursementData;
  let button = <></>;

  // 承認状況 = 未入力（申請なし）
  if (
    !approvalStatus ||
    approvalStatus === ApprovalStatusReimbursement.noInput.code
  ) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="secondary" disabled>
          {ApprovalStatusReimbursement.noInput.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );

    // 承認状況 = 入力中
  } else if (approvalStatus === ApprovalStatusReimbursement.input.code) {
    button = (
      <>
        <Dropdown>
          <Dropdown.Toggle variant={inputCheck ? "secondary" : "info"}>
            {ApprovalStatusReimbursement.input.caption}
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
            handleUpdateApproval(
              ApprovalStatusReimbursement.approvalPending.code
            )
          }
        />
      </>
    );

    // 承認状況 = 提出済
  } else if (
    approvalStatus === ApprovalStatusReimbursement.approvalPending.code
  ) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="primary">
          {ApprovalStatusReimbursement.approvalPending.caption}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() =>
              handleUpdateApproval(ApprovalStatusReimbursement.input.code)
            }
          >
            入力訂正
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    // 承認状況 = 入力ミスにより差戻、再修正中
  } else if (approvalStatus === ApprovalStatusReimbursement.reinput.code) {
    button = (
      <>
        <Dropdown>
          <Dropdown.Toggle variant={inputCheck ? "secondary" : "warning"}>
            {ApprovalStatusReimbursement.reinput.caption}
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
              ApprovalStatusReimbursement.reApprovalPending.code
            )
          }
        />
      </>
    );

    // 承認状況 = 差戻後、再提出
  } else if (
    approvalStatus === ApprovalStatusReimbursement.reApprovalPending.code
  ) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="primary" disabled>
          {ApprovalStatusReimbursement.reApprovalPending.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );

    // 承認状況 = 管理本部の承認済
  } else if (approvalStatus === ApprovalStatusReimbursement.approved.code) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="success" disabled>
          {ApprovalStatusReimbursement.approved.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );
  }

  return button;
}
