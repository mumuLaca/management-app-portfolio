"use client";

import React, { useContext } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { displayComponentContext } from "@/components/help/HelpCanvas";
import styles from "@/styles/Help.module.css";
import { AdminRights } from "@/lib/constants";
import PageSettlement from "./PageSettlement";
import PageAttendance0 from "@/components/help/PageAttendance0";
import PageProfile from "@/components/help/PageProfile";
import PageStatus0 from "@/components/help/PageStatus0";
import PageAddUser from "@/components/help/PageAddUser";
import PageDeleteUser from "@/components/help/PageDeleteUser";
import PageUpdateUser from "@/components/help/PageUpdateUser";
import PageReimbursement from "./PageReimbursement";
import { MdCardTravel } from "react-icons/md";
import { TbFileReport } from "react-icons/tb";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import {
  BsPersonAdd,
  BsPersonDash,
  BsPersonCheck,
  BsPersonBoundingBox,
  BsFillPersonVcardFill,
} from "react-icons/bs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// ページを追加したらここにもコンポーネント情報を追加
const displayItems = [
  {
    component: <PageAttendance0 />,
    iconComp: <TbFileReport />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "勤務表",
    admin: false,
    hidden: [],
  },
  {
    component: <PageSettlement />,
    iconComp: <MdCardTravel />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "交通費精算表",
    admin: true,
    hidden: [],
  },
  {
    component: <PageReimbursement />,
    iconComp: <AiOutlineMoneyCollect />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "立替精算表",
    admin: true,
    hidden: [],
  },
  {
    component: <PageProfile />,
    iconComp: <BsPersonBoundingBox />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "プロフィール",
    admin: false,
    hidden: [],
  },
  {
    component: <PageStatus0 />,
    iconComp: <BsFillPersonVcardFill />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "提出状況",
    admin: true,
    hidden: [AdminRights.general.code],
  },
  {
    component: <PageAddUser />,
    iconComp: <BsPersonAdd />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "メンバー登録",
    admin: true,
    hidden: [AdminRights.general.code, AdminRights.leader.code],
  },
  {
    component: <PageDeleteUser />,
    iconComp: <BsPersonDash />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "メンバー削除",
    admin: true,
    hidden: [AdminRights.general.code, AdminRights.leader.code],
  },
  {
    component: <PageUpdateUser />,
    iconComp: <BsPersonCheck />,
    buttonStyle: styles.HMBasicButtonStyle,
    title: "メンバー変更",
    admin: true,
    hidden: [AdminRights.general.code, AdminRights.leader.code],
  },
];

/**
 * @description
 * ヘルプページ_メイン画面
 */
export default function PageMain() {
  const { setDisplayComponent } = useContext(displayComponentContext);

  // セッション情報取得
  const { data: session } = useSession();
  if (!session) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" />;
      </div>
    );
  }
  const employee = session.employee;

  const colItems = displayItems
    .map((item, index) => {
      if (!item.hidden.includes(employee.admin))
        return (
          <Col xs={4} sm={4} key={index}>
            <div className={styles.HMLinkItem}>
              <button
                className={item.buttonStyle}
                onClick={() => setDisplayComponent(item.component)}
              >
                <span className={`${styles.HMIconStyle}`}>{item.iconComp}</span>
              </button>
              <div className={styles.HMItemTitle}>{item.title}</div>
            </div>
          </Col>
        );
      return;
    })
    .filter((element) => element);

  const displayHTML = [];

  for (let i = 0; i < colItems.length; i += 3) {
    displayHTML.push(
      <Row className="pb-4" key={i}>
        {colItems.slice(i, i + 3)}
      </Row>
    );
  }

  return (
    <>
      <Container className="text-center">
        <Row className="pb-4">
          <Col className={styles.HMTitle}>
            <h3>ポータル</h3>
          </Col>
        </Row>
        {displayHTML}
      </Container>
    </>
  );
}
