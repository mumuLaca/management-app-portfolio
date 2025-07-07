"use client";

import { Employee } from "@prisma/client";
import axios from "axios";
import { Dispatch, JSX, SetStateAction, useState } from "react";
import { Button, Dropdown, Table } from "react-bootstrap";
import { KeyedMutator } from "swr";
import styles from "@/styles/CustomScroll.module.css";
import ModalRevert from "@/components/manage/status/ModalRevert";
import ModalConfirm from "../../modal/ModalConfirm";
import { MODALMESSAGE } from "@/lib/modalMessage";
import { Session } from "next-auth";
import { TypeAPIResponse } from "@/app/api/approval/status/[yearMonth]/[filterSection]/route";
import {
  AdminRights,
  ApprovalStatusDailyReport,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
  ReportPattern,
} from "@/lib/constants";
import ModalSettlement from "./ModalSettlement";
import {
  getApprovalDailyReportKey,
  getApprovalReimbursementKey,
  getApprovalSettlementKey,
} from "@/utils/constantsUtil";
import ModalDailyReport from "./ModalDailyReport";
import ModalReimbursement from "./ModalReimbursement";
import dayjs from "@/lib/dayjs";

interface Props {
  session: Session;
  employeeList?: TypeAPIResponse[];
  mutateEmployeeList: KeyedMutator<TypeAPIResponse[]>;
  yearMonth: string;
  filterReport: string;
}

interface ApprovalButtonProps {
  session: Session;
  mutateEmployeeList: KeyedMutator<TypeAPIResponse[]>;
  userInfo: TypeAPIResponse;
  setModalRevertOpenFlg: Dispatch<SetStateAction<boolean>>;
  handleModalRevertOpen: (userInfo: TypeAPIResponse) => Promise<void>;
}

/**
 * @description
 * 提出状況一覧_リスト
 */
export default function List({
  session,
  employeeList,
  mutateEmployeeList,
  yearMonth,
  filterReport,
}: Props) {
  const [employeeInfo, setEmployeeInfo] = useState<Employee>();

  // 差戻モーダル用
  const [modalRevertOpenFlg, setModalRevertOpenFlg] = useState(false);
  const [revertData, setRevertData] = useState<
    TypeAPIResponse & { reportPattern: string }
  >();

  // 明細閲覧用
  const [dailyReportModalOpenFlg, setDailyReportModalOpenFlg] =
    useState<boolean>(false);
  const [settlementModalOpenFlg, setSettlementModalOpenFlg] =
    useState<boolean>(false);
  const [reimbursementModalOpenFlg, setReimbursementModalOpenFlg] =
    useState<boolean>(false);

  /** 閲覧ボタンの活性制御 */
  const disabledView = (obj: TypeAPIResponse): boolean => {
    switch (filterReport) {
      // 勤務表
      case ReportPattern.dailyReport.code:
        return (
          obj.statusOfDailyReport === ApprovalStatusDailyReport.unapproved.code
        );
      // 旅費精算表
      case ReportPattern.settlement.code:
        return obj.statusOfSettlement === ApprovalStatusSettlement.noInput.code;
      // 立替精算表
      case ReportPattern.reimbursement.code:
        return (
          obj.statusOfReimbursement === ApprovalStatusReimbursement.noInput.code
        );
      // 上記以外
      default:
        return true;
    }
  };

  /** 閲覧ボタンより対象表をモーダル表示  */
  const handleOpenReport = async (employeeId: number) => {
    // レポートの種類別にデータ取得
    switch (filterReport) {
      // 勤務表
      case ReportPattern.dailyReport.code:
        await axios
          .get(`/api/employee/get/${employeeId}`)
          .then((res) => setEmployeeInfo(res.data))
          .finally(() => {
            setDailyReportModalOpenFlg(true);
          });
        break;
      // 旅費精算表
      case ReportPattern.settlement.code:
        await axios
          .get(`/api/employee/get/${employeeId}`)
          .then((res) => setEmployeeInfo(res.data))
          .finally(() => {
            setSettlementModalOpenFlg(true);
          });
        break;
      // 立替精算表
      case ReportPattern.reimbursement.code:
        await axios
          .get(`/api/employee/get/${employeeId}`)
          .then((res) => setEmployeeInfo(res.data))
          .finally(() => {
            setReimbursementModalOpenFlg(true);
          });
        break;
    }
  };

  /** 差戻モーダルを開く */
  const handleModalRevertOpen = async (userInfo: TypeAPIResponse) => {
    setRevertData({
      reportPattern: filterReport,
      ...userInfo,
    });
    setModalRevertOpenFlg(true);
  };

  return (
    <>
      <div className={`h-100 ${styles.scrollHidden}`}>
        <Table bordered striped>
          <colgroup>
            <col style={{ minWidth: 130, width: 140 }} />
            <col style={{ minWidth: 130, width: 140 }} />
            <col style={{ minWidth: 140 }} />
            <col style={{ minWidth: 150 }} />
            <col style={{ minWidth: 150 }} />
            <col style={{ minWidth: 100 }} />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>閲覧</th>
              <th>社員番号</th>
              <th>氏名</th>
              <th>所属</th>
              <th>稼働(h)</th>
            </tr>
          </thead>
          <tbody>
            {employeeList &&
              employeeList.map((obj) => (
                <tr key={obj.id}>
                  <td className="text-center">
                    {filterReport === ReportPattern.dailyReport.code ? (
                      <ApprovalButtonDailyReport
                        session={session}
                        mutateEmployeeList={mutateEmployeeList}
                        userInfo={obj}
                        setModalRevertOpenFlg={setModalRevertOpenFlg}
                        handleModalRevertOpen={handleModalRevertOpen}
                      />
                    ) : filterReport === ReportPattern.settlement.code ? (
                      <ApprovalButtonSettlement
                        session={session}
                        mutateEmployeeList={mutateEmployeeList}
                        userInfo={obj}
                        setModalRevertOpenFlg={setModalRevertOpenFlg}
                        handleModalRevertOpen={handleModalRevertOpen}
                      />
                    ) : (
                      <ApprovalButtonReimbursement
                        session={session}
                        mutateEmployeeList={mutateEmployeeList}
                        userInfo={obj}
                        setModalRevertOpenFlg={setModalRevertOpenFlg}
                        handleModalRevertOpen={handleModalRevertOpen}
                      />
                    )}
                  </td>
                  <td className="text-center">
                    <Button
                      variant={disabledView(obj) ? "secondary" : "success"}
                      type="button"
                      className="px-4"
                      disabled={disabledView(obj)}
                      onClick={() => handleOpenReport(obj.id)}
                    >
                      閲覧
                    </Button>
                  </td>
                  <td>{obj.id}</td>
                  <td>{obj.name}</td>
                  <td>{obj.section}</td>
                  <td>{Number(obj.totalActive)}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
      <ModalSettlement
        settlementModalOpenFlg={settlementModalOpenFlg}
        setSettlementModalOpenFlg={setSettlementModalOpenFlg}
        employee={employeeInfo!}
        yearMonth={yearMonth}
      />
      <ModalDailyReport
        dailyReportModalOpenFlg={dailyReportModalOpenFlg}
        setDailyReportModalOpenFlg={setDailyReportModalOpenFlg}
        employee={employeeInfo!}
        yearMonth={yearMonth}
      />
      <ModalReimbursement
        reimbursementModalOpenFlg={reimbursementModalOpenFlg}
        setReimbursementModalOpenFlg={setReimbursementModalOpenFlg}
        employee={employeeInfo!}
        yearMonth={yearMonth}
      />
      <ModalRevert
        modalRevertOpenFlg={modalRevertOpenFlg}
        setModalRevertOpenFlg={setModalRevertOpenFlg}
        revertData={revertData!}
        mutate={mutateEmployeeList}
        yearAndMonth={yearMonth}
      />
    </>
  );
}

/**
 * @description
 * 承認ボタン（勤務表）の作成
 */
function ApprovalButtonDailyReport({
  session,
  mutateEmployeeList,
  userInfo,
  handleModalRevertOpen,
}: ApprovalButtonProps): JSX.Element {
  const [confirmModalShow, setConfirmModalShow] = useState<boolean>(false);

  /** 承認処理 */
  const handleSubmit = async () => {
    // 承認API発行
    await axios.post(`/api/approval/update/dailyReport`, {
      id: userInfo.id,
      yearMonth: userInfo.yearMonth,
      approve: ApprovalStatusDailyReport.approved.code,
    });

    // 確認モーダルを閉じる
    setConfirmModalShow(false);
    // 表示の更新
    mutateEmployeeList();
  };

  // 以下はボタン日活性
  // ・管理者以外
  // ・2か月以前
  if (
    session.employee.admin !== AdminRights.admin.code ||
    dayjs()
      .subtract(1, "month")
      .isAfter(dayjs(userInfo.yearMonth, "YYYYMM"), "month")
  ) {
    return (
      <Button variant="secondary" disabled>
        {
          ApprovalStatusDailyReport[
            getApprovalDailyReportKey(userInfo.statusOfDailyReport)
          ].caption
        }
      </Button>
    );
  }

  // 勤務表の承認状況に応じたボタンの作成
  switch (userInfo.statusOfDailyReport) {
    // 未承認
    case ApprovalStatusDailyReport.unapproved.code:
      return (
        <Button variant="secondary" disabled>
          {ApprovalStatusDailyReport.unapproved.caption}
        </Button>
      );

    // 入力中
    case ApprovalStatusDailyReport.input.code:
      return (
        <>
          <Dropdown>
            <Dropdown.Toggle variant="secondary">
              {ApprovalStatusDailyReport.input.caption}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setConfirmModalShow(true)}>
                承認
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <ModalConfirm
            modalMessage={MODALMESSAGE.MM00101}
            show={confirmModalShow}
            setModalShow={setConfirmModalShow}
            executeFunction={() => handleSubmit()}
          />
        </>
      );

    // 承認待ち
    case ApprovalStatusDailyReport.approvalPending.code:
      return (
        <>
          <Dropdown>
            <Dropdown.Toggle variant="primary">承認可</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleSubmit}>承認</Dropdown.Item>
              <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
                差戻し
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <ModalConfirm
            modalMessage={MODALMESSAGE.MM00101}
            show={confirmModalShow}
            setModalShow={setConfirmModalShow}
            executeFunction={() => handleSubmit()}
          />
        </>
      );

    // 差戻中
    case ApprovalStatusDailyReport.reinput.code:
      return (
        <Button variant="warning" disabled>
          {ApprovalStatusDailyReport.reinput.caption}
        </Button>
      );

    // 再申請中
    case ApprovalStatusDailyReport.reApprovalPending.code:
      return (
        <Dropdown>
          <Dropdown.Toggle variant="primary">承認可</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleSubmit}>承認</Dropdown.Item>
            <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
              差戻し
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

    // 承認済
    case ApprovalStatusDailyReport.approved.code:
      return (
        <Dropdown>
          <Dropdown.Toggle variant="success">
            {ApprovalStatusDailyReport.approved.caption}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
              差戻し
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
  }
  return <></>;
}

/**
 * @description
 * 承認ボタン（旅費精算表）の作成
 */
function ApprovalButtonSettlement({
  session,
  mutateEmployeeList,
  userInfo,
  handleModalRevertOpen,
}: ApprovalButtonProps): JSX.Element {
  const [confirmModalShow, setConfirmModalShow] = useState<boolean>(false);

  /** 承認処理 */
  const handleSubmit = async () => {
    // 承認API発行
    await axios.post(`/api/approval/update/settlement`, {
      id: userInfo.id,
      yearMonth: userInfo.yearMonth,
      approve: ApprovalStatusSettlement.approved.code,
    });

    // 確認モーダルを閉じる
    setConfirmModalShow(false);
    // 表示の更新
    mutateEmployeeList();
  };

  // 以下はボタン日活性
  // ・管理者以外
  // ・2か月以前
  if (
    session.employee.admin !== AdminRights.admin.code ||
    dayjs()
      .subtract(1, "month")
      .isAfter(dayjs(userInfo.yearMonth, "YYYYMM"), "month")
  ) {
    return (
      <Button variant="secondary" disabled>
        {
          ApprovalStatusSettlement[
            getApprovalSettlementKey(userInfo.statusOfSettlement)
          ].caption
        }
      </Button>
    );
  }

  // 勤務表の承認状況に応じたボタンの作成
  switch (userInfo.statusOfSettlement) {
    // 未承認
    case ApprovalStatusSettlement.noInput.code:
      return (
        <Button variant="secondary" disabled>
          {ApprovalStatusSettlement.noInput.caption}
        </Button>
      );

    // 入力中
    case ApprovalStatusSettlement.input.code:
      return (
        <>
          <Dropdown>
            <Dropdown.Toggle variant="secondary">
              {ApprovalStatusSettlement.input.caption}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setConfirmModalShow(true)}>
                承認
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <ModalConfirm
            modalMessage={MODALMESSAGE.MM00101}
            show={confirmModalShow}
            setModalShow={setConfirmModalShow}
            executeFunction={() => handleSubmit()}
          />
        </>
      );

    // 承認待ち
    case ApprovalStatusSettlement.approvalPending.code:
      return (
        <>
          <Dropdown>
            <Dropdown.Toggle variant="primary">承認可</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleSubmit}>承認</Dropdown.Item>
              <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
                差戻し
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <ModalConfirm
            modalMessage={MODALMESSAGE.MM00101}
            show={confirmModalShow}
            setModalShow={setConfirmModalShow}
            executeFunction={() => handleSubmit()}
          />
        </>
      );

    // 差戻中
    case ApprovalStatusSettlement.reinput.code:
      return (
        <Button variant="warning" disabled>
          {ApprovalStatusSettlement.reinput.caption}
        </Button>
      );

    // 再申請中
    case ApprovalStatusSettlement.reApprovalPending.code:
      return (
        <Dropdown>
          <Dropdown.Toggle variant="primary">承認可</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleSubmit}>承認</Dropdown.Item>
            <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
              差戻し
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

    // 承認済
    case ApprovalStatusSettlement.approved.code:
      return (
        <Dropdown>
          <Dropdown.Toggle variant="success">
            {ApprovalStatusSettlement.approved.caption}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
              差戻し
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
  }
  return <></>;
}

/**
 * @description
 * 承認ボタン（立替精算表）の作成
 */
function ApprovalButtonReimbursement({
  session,
  mutateEmployeeList,
  userInfo,
  handleModalRevertOpen,
}: ApprovalButtonProps): JSX.Element {
  const [confirmModalShow, setConfirmModalShow] = useState<boolean>(false);

  /** 承認処理 */
  const handleSubmit = async () => {
    // 承認API発行
    await axios.post(`/api/approval/update/reimbursement`, {
      id: userInfo.id,
      yearMonth: userInfo.yearMonth,
      approve: ApprovalStatusReimbursement.approved.code,
    });

    // 確認モーダルを閉じる
    setConfirmModalShow(false);
    // 表示の更新
    mutateEmployeeList();
  };

  // 以下はボタン日活性
  // ・管理者以外
  // ・2か月以前
  if (
    session.employee.admin !== AdminRights.admin.code ||
    dayjs()
      .subtract(1, "month")
      .isAfter(dayjs(userInfo.yearMonth, "YYYYMM"), "month")
  ) {
    return (
      <Button variant="secondary" disabled>
        {
          ApprovalStatusReimbursement[
            getApprovalReimbursementKey(userInfo.statusOfReimbursement)
          ].caption
        }
      </Button>
    );
  }

  // 勤務表の承認状況に応じたボタンの作成
  switch (userInfo.statusOfReimbursement) {
    // 未承認
    case ApprovalStatusReimbursement.noInput.code:
      return (
        <Button variant="secondary" disabled>
          {ApprovalStatusReimbursement.noInput.caption}
        </Button>
      );

    // 入力中
    case ApprovalStatusReimbursement.input.code:
      return (
        <>
          <Dropdown>
            <Dropdown.Toggle variant="secondary">
              {ApprovalStatusReimbursement.input.caption}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setConfirmModalShow(true)}>
                承認
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <ModalConfirm
            modalMessage={MODALMESSAGE.MM00101}
            show={confirmModalShow}
            setModalShow={setConfirmModalShow}
            executeFunction={() => handleSubmit()}
          />
        </>
      );

    // 承認待ち
    case ApprovalStatusReimbursement.approvalPending.code:
      return (
        <>
          <Dropdown>
            <Dropdown.Toggle variant="primary">承認可</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleSubmit}>承認</Dropdown.Item>
              <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
                差戻し
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <ModalConfirm
            modalMessage={MODALMESSAGE.MM00101}
            show={confirmModalShow}
            setModalShow={setConfirmModalShow}
            executeFunction={() => handleSubmit()}
          />
        </>
      );

    // 差戻中
    case ApprovalStatusReimbursement.reinput.code:
      return (
        <Button variant="warning" disabled>
          {ApprovalStatusReimbursement.reinput.caption}
        </Button>
      );

    // 再申請中
    case ApprovalStatusReimbursement.reApprovalPending.code:
      return (
        <Dropdown>
          <Dropdown.Toggle variant="primary">承認可</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleSubmit}>承認</Dropdown.Item>
            <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
              差戻し
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

    // 承認済
    case ApprovalStatusReimbursement.approved.code:
      return (
        <Dropdown>
          <Dropdown.Toggle variant="success">
            {ApprovalStatusReimbursement.approved.caption}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleModalRevertOpen(userInfo)}>
              差戻し
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
  }
  return <></>;
}
