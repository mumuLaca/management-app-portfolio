"use client";

import styles from "@/styles/SideBar.module.css";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Dispatch, useEffect, useState } from "react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { AdminRights } from "@/lib/constants";
import Profile from "./Profile";
import actIcon from "@/app/logo.png";
import Image from "next/image";
import { IoHomeOutline } from "react-icons/io5";
import { TbFileReport } from "react-icons/tb";
import { RiArrowDownDoubleLine } from "react-icons/ri";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { FaMoneyCheckAlt, FaSlack } from "react-icons/fa";
import { IoIosLogOut, IoIosMailOpen } from "react-icons/io";
import { SiHomepage } from "react-icons/si";
import {
  BsPersonAdd,
  BsPersonDash,
  BsPersonGear,
  BsPersonCheck,
  BsPersonBoundingBox,
  BsFillPersonVcardFill,
} from "react-icons/bs";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineAdminPanelSettings,
  MdCardTravel,
  MdOutlineDevicesOther,
} from "react-icons/md";
import { Button } from "react-bootstrap";

/**
 * @description
 * サイドバー
 */
export default function SideBar({
  session,
  sidebarShow,
  setSidebarShow,
}: {
  session: Session;
  sidebarShow: boolean;
  setSidebarShow: Dispatch<React.SetStateAction<boolean>>;
}) {
  const [subAdminShow, setSubAdminShow] = useState<boolean>(false);
  const [settingsShow, setSettingsShow] = useState<boolean>(false);
  const [externalLinkShow, setExternalLinkShow] = useState<boolean>(false);
  const [profileOpenFlg, setProfileOpenFlg] = useState<boolean>(false);
  const [pathName, setPathName] = useState<string>("/");

  const pathname = usePathname();

  /** useEffect */
  useEffect(() => {
    setPathName(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarShow) {
      setSubAdminShow(false);
      setSettingsShow(false);
      setExternalLinkShow(false);
    }
  }, [sidebarShow]);

  return (
    <>
      <nav
        id="sidebar"
        className={
          sidebarShow
            ? `${styles.sidebar}`
            : `${styles.sidebar} ${styles.close}`
        }
      >
        <ul>
          <li>
            <div className={styles.sidebarHeader}>
              <Image
                src={actIcon}
                height={30}
                width={30}
                alt="NoImage"
                className={styles.headerIcon}
              />
              <span className={styles.logo}>ACTCITY</span>
            </div>
            <button
              onClick={() => setSidebarShow(!sidebarShow)}
              id="toggleBtn"
              className={styles.toggleBtn}
            >
              <MdOutlineKeyboardDoubleArrowLeft
                className={
                  sidebarShow
                    ? `${styles.topIcon}`
                    : `${styles.topIcon} ${styles.sBRotate}`
                }
              />
            </button>
          </li>
          <li>
            <Link
              onClick={() => setSidebarShow(false)}
              href="/"
              className={pathName === "/" ? `${styles.active}` : ``}
            >
              <IoHomeOutline />
              <span>HOME</span>
            </Link>
          </li>
          <li>
            <Link
              onClick={() => setSidebarShow(false)}
              href="/daily"
              className={pathName === "/daily" ? `${styles.active}` : ``}
            >
              <TbFileReport />
              <span>勤務表</span>
            </Link>
          </li>
          <li>
            <Link
              onClick={() => setSidebarShow(false)}
              href="/settlement"
              className={pathName === "/settlement" ? `${styles.active}` : ``}
            >
              <MdCardTravel />
              <span>旅費精算表</span>
            </Link>
          </li>
          <li>
            <Link
              onClick={() => setSidebarShow(false)}
              href="/reimbursement"
              className={
                pathName === "/reimbursement" ? `${styles.active}` : ``
              }
            >
              <AiOutlineMoneyCollect />
              <span>立替精算表</span>
            </Link>
          </li>
          {session.employee.admin !== AdminRights.general.code && (
            <li>
              <button
                onClick={() => {
                  setSidebarShow(true);
                  setSubAdminShow(!subAdminShow);
                }}
                className={`${styles.dropdownBtn} ${
                  pathName.startsWith("/manage/") && `${styles.active}`
                }`}
              >
                <MdOutlineAdminPanelSettings />
                <span>管理情報</span>
                <RiArrowDownDoubleLine
                  className={
                    subAdminShow
                      ? `${styles.dropdownBtnTgl} ${styles.rotate}`
                      : `${styles.dropdownBtnTgl}`
                  }
                />
              </button>
              {(session.employee.admin === AdminRights.admin.code ||
                session.employee.admin === AdminRights.leader.code) && (
                <ul
                  className={
                    subAdminShow
                      ? `${styles.subMenu} ${styles.show}`
                      : `${styles.subMenu}`
                  }
                >
                  <div className={styles.subMenuDetail}>
                    {session.employee.admin === AdminRights.leader.code ? (
                      <li>
                        <Link
                          onClick={() => setSidebarShow(false)}
                          href="/manage/status"
                          className={
                            pathName === "/manage/status"
                              ? `${styles.active}`
                              : ``
                          }
                        >
                          <BsFillPersonVcardFill />
                          <span>提出状況</span>
                        </Link>
                      </li>
                    ) : (
                      <>
                        <li>
                          <Link
                            onClick={() => setSidebarShow(false)}
                            href="/manage/status"
                            className={
                              pathName === "/manage/status"
                                ? `${styles.active}`
                                : ``
                            }
                          >
                            <BsFillPersonVcardFill />
                            <span>提出状況</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setSidebarShow(false)}
                            href="/manage/addUser"
                            className={
                              pathName === "/manage/addUser"
                                ? `${styles.active}`
                                : ``
                            }
                          >
                            <BsPersonAdd />
                            <span>ユーザー登録</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setSidebarShow(false)}
                            href="/manage/deleteUser"
                            className={
                              pathName === "/manage/deleteUser"
                                ? `${styles.active}`
                                : ``
                            }
                          >
                            <BsPersonDash />
                            <span>ユーザー削除</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setSidebarShow(false)}
                            href="/manage/updateUser"
                            className={
                              pathName === "/manage/updateUser"
                                ? `${styles.active}`
                                : ``
                            }
                          >
                            <BsPersonCheck />
                            <span>ユーザー更新</span>
                          </Link>
                        </li>
                      </>
                    )}
                  </div>
                </ul>
              )}
            </li>
          )}
          <li>
            <button
              onClick={() => {
                setSidebarShow(true);
                setSettingsShow(!settingsShow);
              }}
              className={`${styles.dropdownBtn} ${
                profileOpenFlg && `${styles.active}`
              }`}
            >
              <BsPersonGear />
              <span>設定</span>
              <RiArrowDownDoubleLine
                className={
                  settingsShow
                    ? `${styles.dropdownBtnTgl} ${styles.rotate}`
                    : `${styles.dropdownBtnTgl}`
                }
              />
            </button>
            <ul
              className={
                settingsShow
                  ? `${styles.subMenu} ${styles.show}`
                  : `${styles.subMenu}`
              }
            >
              <div className={styles.subMenuDetail}>
                <li>
                  <Button
                    className={`${styles.profileButton} ${
                      profileOpenFlg ? styles.active : ``
                    }`}
                    onClick={() => {
                      setSidebarShow(false);
                      setProfileOpenFlg(true);
                    }}
                  >
                    <BsPersonBoundingBox />
                    <span>プロフィール</span>
                  </Button>
                </li>
                <li>
                  <Link
                    href={""}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <IoIosLogOut />
                    <span>ログアウト</span>
                  </Link>
                </li>
              </div>
            </ul>
          </li>
          <li>
            <button
              onClick={() => {
                setSidebarShow(true);
                setExternalLinkShow(!externalLinkShow);
              }}
              className={`${styles.dropdownBtn}`}
            >
              <MdOutlineDevicesOther />
              <span>外部リンク</span>
              <RiArrowDownDoubleLine
                className={
                  externalLinkShow
                    ? `${styles.dropdownBtnTgl} ${styles.rotate}`
                    : `${styles.dropdownBtnTgl}`
                }
              />
            </button>
            <ul
              className={
                externalLinkShow
                  ? `${styles.subMenu} ${styles.show}`
                  : `${styles.subMenu}`
              }
            >
              <div className={styles.subMenuDetail}>
                <li>
                  <a
                    href="https://s-paycial.shinwart.com/actcity/Login"
                    target="_blank"
                    rel="noreferrer,noopener"
                  >
                    <FaMoneyCheckAlt />
                    <span>S-PAYCIAL</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://secure.xserver.ne.jp/xapanel/login/xserver/mail/"
                    target="_blank"
                    rel="noreferrer,noopener"
                  >
                    <IoIosMailOpen />
                    <span>WEBメール</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://app.slack.com/client/T01153Q01BQ"
                    target="_blank"
                    rel="noreferrer,noopener"
                  >
                    <FaSlack />
                    <span>Slack</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://actcity.co.jp/"
                    target="_blank"
                    rel="noreferrer,noopener"
                  >
                    <SiHomepage />
                    <span>会社HP</span>
                  </a>
                </li>
              </div>
            </ul>
          </li>
        </ul>
      </nav>
      <Profile
        profileOpenFlg={profileOpenFlg}
        setProfileOpenFlg={setProfileOpenFlg}
        session={session!}
      />
    </>
  );
}
