"use client";

import {
  ApprovalStatusAttendance,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
  ReportPattern,
} from "@/lib/constants";
import styles from "@/styles/Main.module.css";
import React from "react";
import {
  getApprovalAttendanceKey,
  getApprovalReimbursementKey,
  getApprovalSettlementKey,
} from "@/utils/constantsUtil";
import { Approval } from "@prisma/client";
import Link from "next/link";
import { FaRegThumbsUp } from "react-icons/fa";
import { MdCardTravel } from "react-icons/md";
import { TbFileReport } from "react-icons/tb";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { GoAlertFill } from "react-icons/go";
import { AiFillAlert } from "react-icons/ai";
import { IoIosNotifications } from "react-icons/io";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * @description
 * メイン画面
 */
export default function HomeMain({ initData }: { initData: Approval[] }) {
  /** 月別稼働時間取得 */
  const getTotalActive = (yearMonth: string) => {
    const targetTotalActive = initData?.find(
      (obj) => obj.yearMonth === yearMonth
    );

    return targetTotalActive?.totalActive
      ? targetTotalActive.totalActive.toString()
      : "0";
  };

  /** 勤務表‗承認状況取得 */
  const getApprovalOfAttendance = (yearMonth: string) => {
    const targetApproval = initData?.find((obj) => obj.yearMonth === yearMonth);

    if (!targetApproval) return ApprovalStatusAttendance.unapproved.caption;

    return ApprovalStatusAttendance[
      getApprovalAttendanceKey(targetApproval?.statusOfAttendance)
    ].caption;
  };

  /** 交通費精算表‗承認状況取得 */
  const getApprovalOfSettlement = (yearMonth: string) => {
    const targetApproval = initData?.find((obj) => obj.yearMonth === yearMonth);

    if (!targetApproval) return ApprovalStatusSettlement.noInput.caption;

    return ApprovalStatusSettlement[
      getApprovalSettlementKey(targetApproval?.statusOfSettlement)
    ].caption;
  };

  /** 交通費精算表‗立替精算表 */
  const getApprovalOfReimbursement = (yearMonth: string) => {
    const targetApproval = initData?.find((obj) => obj.yearMonth === yearMonth);

    if (!targetApproval) return ApprovalStatusReimbursement.noInput.caption;

    return ApprovalStatusReimbursement[
      getApprovalReimbursementKey(targetApproval?.statusOfReimbursement)
    ].caption;
  };

  /** ステータスカードのレイアウト変更 */
  const setColorOfStatus = (yearMonth: string, reportPattern: string) => {
    const className = "";
    const targetApproval = initData?.find((obj) => obj.yearMonth === yearMonth);

    // データが存在しない場合は初期値を返却
    if (!targetApproval) return className;

    let status = "";
    // レポート別の承認ステータスを取得
    switch (reportPattern) {
      // 勤務表
      case ReportPattern.attendance.code:
        status = targetApproval.statusOfAttendance;
        break;
      // 交通費精算表
      case ReportPattern.settlement.code:
        status = targetApproval.statusOfSettlement;
        break;
      // 立替精算表
      case ReportPattern.reimbursement.code:
        status = targetApproval.statusOfReimbursement;
        break;
    }

    let fontColor = "text-white";
    // 承認状況によってレイアウトを決定
    switch (status) {
      // 入力中、申請なし
      case ApprovalStatusAttendance.unapproved.code:
      case ApprovalStatusSettlement.noInput.code:
      case ApprovalStatusReimbursement.noInput.code:
        fontColor = "text-secondary";
        break;
      // 入力中
      case ApprovalStatusAttendance.input.code:
      case ApprovalStatusSettlement.input.code:
      case ApprovalStatusReimbursement.input.code:
        fontColor = "text-info";
        break;
      // 承認待ち
      case ApprovalStatusAttendance.approvalPending.code:
      case ApprovalStatusSettlement.approvalPending.code:
      case ApprovalStatusReimbursement.approvalPending.code:
        fontColor = "text-primary";
        break;
      // 承認済
      case ApprovalStatusAttendance.approved.code:
      case ApprovalStatusSettlement.approved.code:
      case ApprovalStatusReimbursement.approved.code:
        fontColor = "text-success";
        break;
      // 差戻中
      case ApprovalStatusAttendance.reinput.code:
      case ApprovalStatusSettlement.reinput.code:
      case ApprovalStatusReimbursement.reinput.code:
        fontColor = "text-warning";
        break;
      // 再申請中
      case ApprovalStatusAttendance.reApprovalPending.code:
      case ApprovalStatusSettlement.reApprovalPending.code:
      case ApprovalStatusReimbursement.reApprovalPending.code:
        fontColor = "text-primary";
        break;
    }
    return fontColor;
  };

  /** レポート別の承認状況を返却する */
  const setStatusOfReport = (yearMonth: string, reportPattern: string) => {
    switch (reportPattern) {
      // 勤務表
      case ReportPattern.attendance.code:
        return getApprovalOfAttendance(yearMonth);
      // 交通費精算表
      case ReportPattern.settlement.code:
        return getApprovalOfSettlement(yearMonth);
      // 立替精算表
      case ReportPattern.reimbursement.code:
        return getApprovalOfReimbursement(yearMonth);
    }
  };

  /** 承認状況_アラート表示 */
  const displayStatusAlert = (obj: Approval) => {
    // ステータスの配列
    const statusValues = [
      obj.statusOfAttendance,
      obj.statusOfSettlement,
      obj.statusOfReimbursement,
    ];

    // 差戻中ステータス
    const reinputStatuses = [
      ApprovalStatusAttendance.reinput.code,
      ApprovalStatusSettlement.reinput.code,
      ApprovalStatusReimbursement.reinput.code,
    ];

    // 入力中ステータス
    const inputStatuses = [
      ApprovalStatusAttendance.input.code,
      ApprovalStatusSettlement.input.code,
      ApprovalStatusReimbursement.input.code,
    ];

    // 承認済を表示するステータス(交通費精算、立替精算は申請なしも含む)
    const approvedStatusesDR = [ApprovalStatusAttendance.approved.code];
    const approvedStatusesStl = [
      ApprovalStatusSettlement.noInput.code,
      ApprovalStatusSettlement.approved.code,
    ];
    const approvedStatusesReim = [
      ApprovalStatusReimbursement.noInput.code,
      ApprovalStatusReimbursement.approved.code,
    ];

    // ステータスアラートの作成
    const getStatusAlert = (
      className: string,
      icon: React.ReactNode,
      message: string
    ) => (
      <span className={`${className} ${styles.stAlert}`}>
        {icon}
        {message}
      </span>
    );

    // 差戻中ステータスが含まれている場合
    if (reinputStatuses.some((val) => statusValues.includes(val))) {
      return getStatusAlert("text-danger", <GoAlertFill />, "差戻あり");
    }
    // 入力中ステータスが含まれている場合
    else if (inputStatuses.some((val) => statusValues.includes(val))) {
      return getStatusAlert("text-info", <AiFillAlert />, "入力中");
    }
    // 勤務表が未入力の場合
    else if (ApprovalStatusAttendance.unapproved.code === statusValues[0]) {
      return getStatusAlert(
        "text-secondary",
        <IoIosNotifications />,
        "未入力あり"
      );
    }
    // 承認済ステータスが含まれている場合
    else if (
      approvedStatusesDR.some((val) => statusValues[0].includes(val)) &&
      approvedStatusesStl.some((val) => statusValues[1].includes(val)) &&
      approvedStatusesReim.some((val) => statusValues[2].includes(val))
    ) {
      return getStatusAlert("text-success", <FaRegThumbsUp />, "承認済");
    }

    return <></>;
  };

  return (
    <div className="container-fluid">
      <div className={styles.statusRow}>
        {initData &&
          initData.map((obj, index) => (
            <Card key={index} className={styles.statusCard}>
              <CardContent className="px-1 py-1">
                <CardHeader className={styles.cardTitle}>
                  <div className={styles.cardYM}>
                    <span>{obj.yearMonth.slice(0, 4)}</span>
                    <span className={styles.cardM}>
                      <span>/</span>
                      <span>{obj.yearMonth.substring(4)}</span>
                    </span>
                  </div>
                  <div className={styles.cardTextArea}>
                    <span className={styles.cardTextTitle}>稼働</span>
                    <span className={styles.cardTextValue}>
                      {getTotalActive(obj.yearMonth)}h
                    </span>
                  </div>
                </CardHeader>
                <Accordion type="single" collapsible>
                  <AccordionItem value="0" className={styles.accordionItem}>
                    <AccordionTrigger className={styles.accordionHeader}>
                      <div className="w-full flex items-top">
                        <span className={styles.accordionTitle}>承認状況</span>
                        {displayStatusAlert(obj)}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className={styles.accordionBody}>
                      {(Object.values(ReportPattern) as any[]).map(
                        (rep, index) => (
                          <div key={index} className={styles.accordionDiv}>
                            <span className={styles.cardStatusTextTitle}>
                              {rep.name}
                            </span>
                            <span
                              className={`${
                                styles.cardStatusTextValue
                              } ${setColorOfStatus(obj.yearMonth, rep.code)}`}
                            >
                              {setStatusOfReport(obj.yearMonth, rep.code)}
                            </span>
                          </div>
                        )
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
      </div>
      <div>
        <div className={styles.btnArea}>
          <Link
            href="/attendance"
            className={`${styles.btnCommon} ${styles.btnDR}`}
          >
            <div className={`${styles.btnCommonIconArea} `}>
              <div className={styles.btnCommonIconBG}>
                <TbFileReport
                  className={`${styles.btnCommonIcon} ${styles.btnDRColor}`}
                />
              </div>
            </div>
            <div className={`${styles.btnCommonTextArea} ${styles.btnDRColor}`}>
              <span
                className={`${styles.btnCommonTextTitle} ${styles.btnDRColor}`}
              >
                勤務表
              </span>
              <span
                className={`${styles.btnCommonTextBody} ${styles.btnDRBody}`}
              >
                日々の勤怠を入力します。
              </span>
            </div>
          </Link>
          <Link
            href="/settlement"
            className={`${styles.btnCommon} ${styles.btnStl}`}
          >
            <div className={`${styles.btnCommonIconArea}`}>
              <div className={styles.btnCommonIconBG}>
                <MdCardTravel
                  className={`${styles.btnCommonIcon} ${styles.btnStlColor}`}
                />
              </div>
            </div>
            <div
              className={`${styles.btnCommonTextArea} ${styles.btnStlColor}`}
            >
              <span
                className={`${styles.btnCommonTextTitle} ${styles.btnStlColor}`}
              >
                交通費精算表
              </span>
              <span
                className={`${styles.btnCommonTextBody} ${styles.btnStlBody}`}
              >
                現場出社以外の交通費、出張時の費用精算を行います。
              </span>
            </div>
          </Link>
          <Link
            href="/reimbursement"
            className={`${styles.btnCommon} ${styles.btnReim}`}
          >
            <div className={`${styles.btnCommonIconArea}`}>
              <div className={styles.btnCommonIconBG}>
                <AiOutlineMoneyCollect
                  className={`${styles.btnCommonIcon} ${styles.btnReimColor}`}
                />
              </div>
            </div>
            <div
              className={`${styles.btnCommonTextArea} ${styles.btnReimColor}`}
            >
              <span
                className={`${styles.btnCommonTextTitle} ${styles.btnReimColor}`}
              >
                立替精算表
              </span>
              <span
                className={`${styles.btnCommonTextBody} ${styles.btnReimBody}`}
              >
                接待、面談等の立替経費の精算を行います。
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
