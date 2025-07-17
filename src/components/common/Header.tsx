"use client";

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
        <nav
          className={`px-2 ${styles.navBar} flex items-center justify-between bg-white border-b border-gray-200`}
        >
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
          <div className={`text-lg ${styles.nav} flex items-center space-x-4`}>
            <button
              className={styles.linkQuestion}
              onClick={() => seetShowHelp(true)}
            >
              <FaRegQuestionCircle className={styles.questionIcon} />
            </button>
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
          </div>
        </nav>
      </header>
      <Help showHelp={showHelp} seetShowHelp={seetShowHelp} />
    </>
  );
}
