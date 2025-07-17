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
import ModalConfirm from "@/components/modal/ModalConfirm";
import { MODALMESSAGE } from "@/lib/modalMessage";
import { useWindowSize } from "@/lib/useWindowSize";
import { MESSAGE } from "@/lib/message";
import { setCookie } from "cookies-next";
import { TypeMonthlyAttendance } from "@/types/attendance";
import ModalSettlement from "../manage/status/ModalSettlement";
import { Employee } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <div className="mb-1 px-1">
          {editable &&
            attendanceData.approvalStatus ===
              ApprovalStatusAttendance.approved.code && (
              <div className="px-3">
                <Alert>
                  <AlertDescription>{MESSAGE.IM0001.message}</AlertDescription>
                </Alert>
              </div>
            )}
          {editable &&
            attendanceData.approvalStatus ===
              ApprovalStatusAttendance.reinput.code && (
              <div className="px-3">
                <Alert>
                  <AlertDescription>{MESSAGE.WM0001.message}</AlertDescription>
                </Alert>
              </div>
            )}
          {inputCheck && (
            <div className="px-3">
              <Alert>
                <AlertDescription>
                  {MESSAGE[inputCheck].message}
                </AlertDescription>
              </Alert>
            </div>
          )}
          {errorCode && (
            <div className="px-3">
              <Alert>
                <AlertDescription>
                  {MESSAGE[errorCode].message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {width < 992 ? (
            <>
              <div className="flex justify-end pb-2">
                {editable && (
                  <Button variant="secondary" onClick={handleOpenSettlement}>
                    交通費精算閲覧
                  </Button>
                )}
              </div>
              <Accordion
                type="single"
                collapsible
                className="mb-4"
                defaultValue="0"
              >
                <AccordionItem value="0">
                  <AccordionTrigger>
                    <div>
                      <h5>基本情報</h5>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <HeaderDetailComponent />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          ) : (
            <>
              {editable && (
                <div className="flex justify-end pe-3 mb-3">
                  <Button variant="secondary" onClick={handleOpenSettlement}>
                    交通費精算閲覧
                  </Button>
                </div>
              )}
              <HeaderDetailComponent />
            </>
          )}
        </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="mb-2">
          <div className="report-header-title-name">メンバー番号</div>
          <span className="report-header-title-value">{employee.id}</span>
        </div>
        <div className="mb-2">
          <div className="report-header-title-name">氏名</div>
          <span className="report-header-title-value">{employee.name}</span>
        </div>
        <div className="mb-2">
          <div className="report-header-title-name">所属</div>
          <span className="report-header-title-value">{employee.section}</span>
        </div>
        <div className="mb-2">
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
        </div>
        <div>
          <div className="report-header-title-name">入力月</div>
          <div className="flex items-center">
            {editable ? (
              <>
                <Select
                  onValueChange={(value) => setTargetyearMonth!(value)}
                  value={attendanceData.yearMonth}
                >
                  <SelectTrigger className="mx-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsList.map((item, index) => (
                      <SelectItem key={index} value={item.value}>
                        {item.caption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="text-lg">
                {dayjs(attendanceData.yearMonth).format("YYYY年MM月")}
              </div>
            )}
          </div>
        </div>
      </div>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" disabled>
            {ApprovalStatusAttendance.unapproved.caption}
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );

    // 承認状況 = 入力中
  } else if (approvalStatus === ApprovalStatusAttendance.input.code) {
    button = (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={inputCheck ? "secondary" : "default"}>
              {ApprovalStatusAttendance.input.caption}
            </Button>
          </DropdownMenuTrigger>
          {!inputCheck && (
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleOpenConfirmModal}>
                管理本部へ提出
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>{ApprovalStatusAttendance.approvalPending.caption}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              handleUpdateApproval(ApprovalStatusAttendance.input.code)
            }
          >
            入力訂正
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // 承認状況 = 入力ミスにより差戻、再修正中
  } else if (approvalStatus === ApprovalStatusAttendance.reinput.code) {
    button = (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={inputCheck ? "secondary" : "destructive"}>
              {ApprovalStatusAttendance.reinput.caption}
            </Button>
          </DropdownMenuTrigger>
          {!inputCheck && (
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleOpenConfirmModal}>
                管理本部へ再提出
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled>
            {ApprovalStatusAttendance.reApprovalPending.caption}
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );

    // 承認状況 = 管理本部の承認済
  } else if (approvalStatus === ApprovalStatusAttendance.approved.code) {
    button = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" disabled>
            {ApprovalStatusAttendance.approved.caption}
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  }

  return button;
}
