"use client";

import React, { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import styles from "@/styles/Profile.module.css";
import scrollStyles from "@/styles/CustomScroll.module.css";
import { AdminRights, WorkStyle } from "@/lib/constants";
import Image from "next/image";
import axios from "axios";
import TimeList15 from "@/components/common/TimeList15";
import { adminRightsKey } from "@/utils/constantsUtil";
import { Session } from "next-auth";
import { BsPersonBoundingBox } from "react-icons/bs";

interface Props {
  profileOpenFlg: boolean;
  setProfileOpenFlg: Dispatch<SetStateAction<boolean>>;
  session: Session;
}

const radios = [
  { name: "参照", value: "0" },
  { name: "編集", value: "1" },
];

const radiosWorkStyle = [
  { name: WorkStyle.office.mean, value: WorkStyle.office.code },
  { name: WorkStyle.telework.mean, value: WorkStyle.telework.code },
];

/**
 * @description
 * プロフィールのoffCanvas
 */
export default function Profile({
  profileOpenFlg,
  setProfileOpenFlg,
  session,
}: Props) {
  const { employee } = session;
  const [startTime, setStartTime] = React.useState(employee.startTime);
  const [endTime, setEndTime] = React.useState(employee.endTime);
  const [workStyle, setWorkStyle] = React.useState(employee.basicWorkStyle);
  const [isEditable, setIsEditable] = React.useState(false);
  const [isUpdatable, setIsUpdatable] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState("0");

  /** キャンバスを閉じる */
  const handleClose = () => {
    setStartTime(employee.startTime);
    setEndTime(employee.endTime);
    setIsEditable(false);
    setIsUpdatable(false);
    setWorkStyle(employee.basicWorkStyle);
    setRadioValue("0");
    setProfileOpenFlg(false);
  };

  /** メンバー情報の編集状態を変更 */
  const handleEditable = (currentValue: string) => {
    setStartTime(employee.startTime);
    setEndTime(employee.endTime);
    setIsEditable(!isEditable);
    setIsUpdatable(false);
    setWorkStyle(employee.basicWorkStyle);
    setRadioValue(currentValue);
  };

  /** 開始時刻変更 */
  const changeStartTime = (value: string) => {
    setStartTime(value);
    if (
      employee.startTime !== value ||
      employee.endTime !== endTime ||
      employee.basicWorkStyle !== workStyle
    ) {
      setIsUpdatable(true);
    } else {
      setIsUpdatable(false);
    }
  };

  /** 終了時刻変更 */
  const changeEndTime = (value: string) => {
    setEndTime(value);
    if (
      employee.startTime !== startTime ||
      employee.endTime !== value ||
      employee.basicWorkStyle !== workStyle
    ) {
      setIsUpdatable(true);
    } else {
      setIsUpdatable(false);
    }
  };

  /** 基本勤務形態変更時 */
  const changeWorkStyle = (currentWorkStyle: string) => {
    setWorkStyle(currentWorkStyle);

    // set直後にuseStateの値は更新されていないので個別で更新判定を設ける
    if (
      employee.startTime !== startTime ||
      employee.endTime !== endTime ||
      employee.basicWorkStyle !== currentWorkStyle
    ) {
      setIsUpdatable(true);
    } else {
      setIsUpdatable(false);
    }
  };

  /** メンバー情報更新 */
  const handleUpdate = async () => {
    const result = await axios.post("/api/employee/update/id", {
      params: {
        id: employee.id,
        startTime: startTime,
        endTime: endTime,
        basicWorkStyle: workStyle,
      },
    });

    if (result.status === 200) {
      alert("完了しました。画面を更新します。");

      // session更新の為リロード
      window.location.reload();
    } else {
      alert("エラー");
    }
  };

  return (
    <>
      <Sheet
        open={profileOpenFlg}
        onOpenChange={handleClose}
        className={styles.offCanvasLayout}
      >
        <SheetTrigger className={styles.header}>
          <SheetTitle className="flex items-center">
            <BsPersonBoundingBox className="mr-2 h-4 w-4" />
            <span>プロフィール</span>
          </SheetTitle>
        </SheetTrigger>
        <SheetContent className={scrollStyles.attendanceScrollStyle}>
          <div className={styles.mainComponent}>
            <div style={{ height: "100%" }}>
              <div className={styles.topItems}>
                <Image
                  src={session!.user.image}
                  width={75}
                  height={75}
                  alt="NoImage"
                  className={styles.iconImage}
                />
                <div className="flex w-50 mb-3">
                  {radios.map((radio, idx) => (
                    <ToggleGroup
                      type="single"
                      value={radioValue}
                      onValueChange={(value) => handleEditable(value)}
                    >
                      <ToggleGroupItem
                        value={radio.value}
                        id={`radio-${idx}`}
                        className={
                          idx % 2
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {radio.name}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  ))}
                </div>
              </div>

              <div className={styles.employeeInfo}>
                <label>メンバー番号</label>
                <p>{employee.id}</p>
              </div>
              <div className={styles.employeeInfo}>
                <label>氏名</label>
                <p>{employee.name}</p>
              </div>
              <div className={styles.employeeInfo}>
                <label>メールアドレス</label>
                <p>{employee.email}</p>
              </div>
              <div className={styles.employeeInfo}>
                <label>所属</label>
                <p>{employee.section}</p>
              </div>
              <div className={styles.employeeInfo}>
                <label>管理者権限</label>
                <p>{AdminRights[adminRightsKey(employee.admin)].caption}</p>
              </div>
              <div className={styles.employeeInfo}>
                <label className={isEditable ? styles.editOnFontColor : ""}>
                  勤務時間
                </label>
                <div className={styles.regularTimeBox}>
                  <div className={styles.timeEdit}>
                    <input
                      type="time"
                      list="data-list-start-15"
                      className="form-control"
                      value={startTime}
                      required
                      disabled={isEditable ? false : true}
                      onChange={(e) => changeStartTime(e.target.value)}
                      step={900}
                    />
                  </div>
                  <span className="fs-4 px-3">~</span>
                  <div className={styles.timeEdit}>
                    <input
                      type="time"
                      list="data-list-end-15"
                      className="form-control"
                      value={endTime}
                      required
                      disabled={isEditable ? false : true}
                      onChange={(e) => changeEndTime(e.target.value)}
                      step={900}
                    />
                  </div>
                </div>
              </div>
              <div className={`${styles.employeeInfo} pb-3`}>
                <label className={isEditable ? styles.editOnFontColor : ""}>
                  勤務形態
                </label>
                <div className="pt-2 ps-2">
                  <ToggleGroup
                    type="single"
                    value={workStyle}
                    onValueChange={(value) => changeWorkStyle(value)}
                  >
                    <ToggleGroupItem
                      value={radiosWorkStyle[0].value}
                      id={`wsRadio-0`}
                      className={
                        isEditable
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }
                      disabled={isEditable ? false : true}
                    >
                      {radiosWorkStyle[0].name}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={radiosWorkStyle[1].value}
                      id={`wsRadio-1`}
                      className={
                        isEditable
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }
                      disabled={isEditable ? false : true}
                    >
                      {radiosWorkStyle[1].name}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              <div>
                <Button
                  variant={isUpdatable ? "success" : "secondary"}
                  className={`${styles.buttonUpdate} ${
                    isEditable
                      ? styles.buttonUpdateShow
                      : styles.buttonUpdateHidden
                  }`}
                  disabled={isUpdatable ? false : true}
                  onClick={handleUpdate}
                >
                  更新
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <TimeList15 />
    </>
  );
}
