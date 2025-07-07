"use client";

import { Nav, Navbar } from "react-bootstrap";
import styles from "@/styles/Header.module.css";
import sideBarStyles from "@/styles/SideBar.module.css";
import React from "react";
import Image from "next/image";
import Help from "@/components/help/HelpCanvas";
import { Session } from "next-auth";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";

/**
 * @description
 * ヘッダー‗画面共通
 */
export default function Header({
  session,
  setSidebarShow,
}: {
  session: Session;
  setSidebarShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [showHelp, seetShowHelp] = React.useState(false);

  return (
    <>
      <header>
        <Navbar className={`px-2 ${styles.navBar} `}>
          <button
            onClick={() => {
              setSidebarShow(true);
            }}
            id="toggleBtn"
            className={sideBarStyles.toggleBtn}
          >
            <FaBars
              className={`${sideBarStyles.topIcon} ${sideBarStyles.sBRotate}`}
            />
          </button>
          <Nav className={`fs-5 ${styles.nav}`}>
            <Nav.Link
              className={styles.linkQuestion}
              onClick={() => seetShowHelp(true)}
            >
              <FaRegQuestionCircle className={styles.questionIcon} />
            </Nav.Link>
            <div className={styles.profile}>
              <Image
                src={session!.user.image}
                height={30}
                width={30}
                alt="NoImage"
                style={{ borderRadius: "10%", textAlign: "right" }}
              />
              <span className={styles.fontColor}>{session!.employee.name}</span>
            </div>
          </Nav>
        </Navbar>
      </header>
      <Help showHelp={showHelp} seetShowHelp={seetShowHelp} />
    </>
  );
}
