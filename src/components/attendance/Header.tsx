"use client";

import { ApprovalStatusAttendance } from "@/lib/constants";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import {
  Accordion,
  Alert,
  Button,
  Col,
  Container,
  Dropdown,
  Form,
  Row,
} from "react-bootstrap";
import ModalConfirm from "@/components/modal/ModalConfirm";
import { MODALMESSAGE } from "@/lib/modalMessage";
import { useWindowSize } from "@/lib/useWindowSize";
import { MESSAGE } from "@/lib/message";
import { setCookie } from "cookies-next";
import { TypeMonthlyAttendance } from "@/types/attendance";
import ModalSettlement from "../manage/status/ModalSettlement";
import { Employee } from "@prisma/client";

type Props = {
  employee: Employee; // メンバー情報
  attendanceData: TypeMonthlyAttendance; // 勤務表データ
  setTargetyearMonth: Dispatch<SetStateAction<string>> | null; // 年月のusestate
  editable: boolean; // 編集可否
  inputCheck: string; // 入力エラー情報
};

// useContext
const HeaderContext = createContext(
  {} as {
    employee: Employee;
    attendanceData: TypeMonthlyAttendance;
    setTargetyearMonth: Dispatch<SetStateAction<string>> | null;
    editable: boolean;
    inputCheck: string;
    width: number;
    setErrorCode: React.Dispatch<React.SetStateAction<string>>;
  }
);

/**
 * @description
 * 勤務表_ヘッダー
 *
 * メンバー情報や稼働時間等
 */
export default function Header({
  employee,
  attendanceData,
  setTargetyearMonth,
  editable,
  inputCheck,
}: Props) {
  const [width] = useWindowSize();
  const [errorCode, setErrorCode] = useState<string>("");
  const [settlementModalOpenFlg, setSettlementModalOpenFlg] =
    useState<boolean>(false);

  /** 交通費精算表を閲覧 */
  const handleOpenSettlement = () => {
    setSettlementModalOpenFlg(true);
  };

  return (
    <>
      <HeaderContext.Provider
        value={{
          employee,
          attendanceData,
          setTargetyearMonth,
          editable,
          inputCheck,
          width,
          setErrorCode,
        }}
      >
        <Container className="mb-1 px-1">
          {editable &&
            attendanceData.approvalStatus ===
              ApprovalStatusAttendance.approved.code && (
              <Row className="px-3">
                <Alert variant={MESSAGE.IM0001.kind}>
                  {MESSAGE.IM0001.message}
                </Alert>
              </Row>
            )}
          {editable &&
            attendanceData.approvalStatus ===
              ApprovalStatusAttendance.reinput.code && (
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
          {errorCode && (
            <Row className="px-3">
              <Alert variant={MESSAGE[errorCode].kind}>
                {MESSAGE[errorCode].message}
              </Alert>
            </Row>
          )}

          {width < 992 ? (
            <>
              <div className="d-flex justify-content-end pb-2">
                {editable && (
                  <Button variant="info" onClick={handleOpenSettlement}>
                    交通費精算閲覧
                  </Button>
                )}
              </div>
              <Accordion className="mb-4" defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <div>
                      <h5>基本情報</h5>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <HeaderDetailComponent />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </>
          ) : (
            <>
              {editable && (
                <div className="d-flex justify-content-end pe-3 mb-3">
                  <Button variant="info" onClick={handleOpenSettlement}>
                    交通費精算閲覧
                  </Button>
                </div>
              )}
              <HeaderDetailComponent />
            </>
          )}
        </Container>
      </HeaderContext.Provider>
      <ModalSettlement
        settlementModalOpenFlg={settlementModalOpenFlg}
        setSettlementModalOpenFlg={setSettlementModalOpenFlg}
        employee={employee}
        yearMonth={attendanceData.yearMonth!}
      />
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

  // useContextによる値取得
  const { employee, attendanceData, setTargetyearMonth, editable } =
    useContext(HeaderContext);

  return (
    <>
      <Row>
        <Col xs={6} sm={4} lg={2} className="mb-2">
          <div className="report-header-title-name">メンバー番号</div>
          <span className="report-header-title-value">{employee.id}</span>
        </Col>
        <Col xs={6} sm={4} lg={2} className="mb-2">
          <div className="report-header-title-name">氏名</div>
          <span className="report-header-title-value">{employee.name}</span>
        </Col>
        <Col xs={6} sm={4} lg={3} className="mb-2">
          <div className="report-header-title-name">所属</div>
          <span className="report-header-title-value">{employee.section}</span>
        </Col>
        <Col xs={6} sm={4} lg={2} className="mb-2">
          {editable ? (
            <>
              <div className="report-header-title-name">ステータス</div>
              <div className="ps-3">
                <ApprovalButton />
              </div>
            </>
          ) : (
            <></>
          )}
        </Col>
        <Col xs={6} sm={4} lg={2}>
          <div className="report-header-title-name">入力月</div>
          <div className="d-flex align-items-center">
            {editable ? (
              <>
                <Form.Select
                  onChange={(e) => setTargetyearMonth!(e.target.value)}
                  className="mx-2 w-100"
                  value={attendanceData.yearMonth}
                >
                  {monthsList.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.caption}
                    </option>
                  ))}
                </Form.Select>
              </>
            ) : (
              <div className="fs-5">
                {dayjs(attendanceData.yearMonth).format("YYYY年MM月")}
              </div>
            )}
          </div>
        </Col>
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
  const { employee, attendanceData, inputCheck } = useContext(HeaderContext);

  /** 管理本部へ提出 */
  const handleOpenConfirmModal = () => {
    setModalShow(true);
  };

  /** 勤務表の承認状況を更新 */
  const handleUpdateApproval = async (approvalStatus: string) => {
    try {
      // 承認状況を更新
      await axios.post("/api/approval/update/attendance", {
        id: employee.id,
        yearMonth: attendanceData.yearMonth,
        approve: approvalStatus,
      });

      // 「再申請中」への更新は、slackにも通知する
      if (approvalStatus === ApprovalStatusAttendance.reApprovalPending.code) {
        await axios.post("/api/slack/sendSlackMessageToAdmin", {
          message: `【${dayjs(attendanceData.yearMonth).format(
            "YYYY年MM月"
          )}勤務表再提出】\n提出者：${
            employee.name
          }\n勤務表の修正が完了しました。`,
        });
      }

      // Cookieに表示する年月をセット
      setCookie("targetYearAndMonth", attendanceData.yearMonth);
      // 画面更新
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const { approvalStatus } = attendanceData;
  let button = <></>;

  // 承認状況 = 未入力
  if (
    !approvalStatus ||
    approvalStatus === ApprovalStatusAttendance.unapproved.code
  ) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="secondary" disabled>
          {ApprovalStatusAttendance.unapproved.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );

    // 承認状況 = 入力中
  } else if (approvalStatus === ApprovalStatusAttendance.input.code) {
    button = (
      <>
        <Dropdown>
          <Dropdown.Toggle variant={inputCheck ? "secondary" : "info"}>
            {ApprovalStatusAttendance.input.caption}
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
            handleUpdateApproval(ApprovalStatusAttendance.approvalPending.code)
          }
        />
      </>
    );

    // 承認状況 = 提出済
  } else if (approvalStatus === ApprovalStatusAttendance.approvalPending.code) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="primary">
          {ApprovalStatusAttendance.approvalPending.caption}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() =>
              handleUpdateApproval(ApprovalStatusAttendance.input.code)
            }
          >
            入力訂正
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    // 承認状況 = 入力ミスにより差戻、再修正中
  } else if (approvalStatus === ApprovalStatusAttendance.reinput.code) {
    button = (
      <>
        <Dropdown>
          <Dropdown.Toggle variant={inputCheck ? "secondary" : "warning"}>
            {ApprovalStatusAttendance.reinput.caption}
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
              ApprovalStatusAttendance.reApprovalPending.code
            )
          }
        />
      </>
    );

    // 承認状況 = 差戻後、再提出
  } else if (
    approvalStatus === ApprovalStatusAttendance.reApprovalPending.code
  ) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="primary" disabled>
          {ApprovalStatusAttendance.reApprovalPending.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );

    // 承認状況 = 管理本部の承認済
  } else if (approvalStatus === ApprovalStatusAttendance.approved.code) {
    button = (
      <Dropdown>
        <Dropdown.Toggle variant="success" disabled>
          {ApprovalStatusAttendance.approved.caption}
        </Dropdown.Toggle>
      </Dropdown>
    );
  }

  return button;
}
