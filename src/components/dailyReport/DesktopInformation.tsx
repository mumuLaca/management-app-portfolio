import { RoomMember } from "@prisma/client";
import "flatpickr/dist/flatpickr.min.css";
import { Dispatch, useCallback, useState } from "react";
import type { DailyReportCommonUrlParams } from "@/types/types";
import Calendar from "./Calendar";
import JoinUser from "./JoinUser";
import styles from "@/styles/DailyReport.module.css";
import ModalMessageForm from "../common/ModalMessageForm";

type Props = {
  urlParams: DailyReportCommonUrlParams;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  postDataUpdateFlg: boolean;
  setPostDataUpdateFlg: (value: boolean) => void;
  joinUsers: RoomMember[];
  coverOpenFlg: boolean;
  setCoverOpenFlg: Dispatch<React.SetStateAction<boolean>>;
};

/**
 * @description
 * カレンダーエリア
 */
export default function DesktopInformation({
  urlParams,
  date,
  setDate,
  postDataUpdateFlg,
  setPostDataUpdateFlg,
  joinUsers,
  coverOpenFlg,
  setCoverOpenFlg,
}: Props) {
  const [messageModalOpenFlg, setMessageModalOpenFlg] =
    useState<boolean>(false); // メッセージモーダルのオープンフラグ
  const [address, setAddress] = useState<number[]>([]); // 宛先

  const mFormOpenFunction = useCallback(() => {
    setMessageModalOpenFlg(true);
  }, [setMessageModalOpenFlg]);

  const mFormCloseFunction = useCallback(() => {
    setMessageModalOpenFlg(false);
  }, [setMessageModalOpenFlg]);

  return (
    <>
      <div className={styles.calendarSection}>
        <Calendar
          urlParams={urlParams}
          date={date}
          setDate={setDate}
          postDataUpdateFlg={postDataUpdateFlg}
          setPostDataUpdateFlg={setPostDataUpdateFlg}
          coverOpenFlg={coverOpenFlg}
          setCoverOpenFlg={setCoverOpenFlg}
        />
        <JoinUser
          joinUsers={joinUsers!}
          setAddress={setAddress}
          mFormOpenFunction={mFormOpenFunction}
        />
      </div>
      <ModalMessageForm
        address={address}
        messageModalOpenFlg={messageModalOpenFlg}
        mFormCloseFunction={mFormCloseFunction}
      />
    </>
  );
}
