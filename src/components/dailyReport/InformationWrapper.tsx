import { RoomMember } from "@prisma/client";
import "flatpickr/dist/flatpickr.min.css";
import { Dispatch } from "react";
import { DailyReportCommonUrlParams } from "@/pages/dailyReport/[...slug]";
import dynamic from "next/dynamic";
import { useWindowSize } from "@/lib/useWindowSize";

type Props = {
  urlParams: DailyReportCommonUrlParams;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  postDataUpdateFlg: boolean;
  setPostDataUpdateFlg: (value: boolean) => void;
  joinUsers: RoomMember[];
  modalTweetInfoOpenFlg: boolean;
  setModalTweetInfoOpenFlg: Dispatch<React.SetStateAction<boolean>>;
  coverOpenFlg: boolean;
  setCoverOpenFlg: Dispatch<React.SetStateAction<boolean>>;
};

// 動的インポート（初期は undefined → 必要なときにロードされる）
const MobileComponent = dynamic(
  () => import("@/components/dailyReport/ModalInformation"),
  { ssr: false }
);
const DesktopComponent = dynamic(
  () => import("@/components/dailyReport/DesktopInformation"),
  { ssr: false }
);

/**
 * @description
 * 課題登録モーダル
 */
export default function InformationWrapper({
  urlParams,
  date,
  setDate,
  postDataUpdateFlg,
  setPostDataUpdateFlg,
  joinUsers,
  modalTweetInfoOpenFlg,
  setModalTweetInfoOpenFlg,
  coverOpenFlg,
  setCoverOpenFlg,
}: Props) {
  const [width] = useWindowSize();

  if (width === 0) return null; // 初回レンダリングでサイズが取得できるまで待つ

  return width <= 768 ? (
    <MobileComponent
      urlParams={urlParams}
      date={date}
      setDate={setDate}
      postDataUpdateFlg={postDataUpdateFlg}
      setPostDataUpdateFlg={setPostDataUpdateFlg}
      modalTweetInfoOpenFlg={modalTweetInfoOpenFlg}
      setModalTweetInfoOpenFlg={setModalTweetInfoOpenFlg}
      joinUsers={joinUsers!}
      coverOpenFlg={coverOpenFlg}
      setCoverOpenFlg={setCoverOpenFlg}
    />
  ) : (
    <DesktopComponent
      urlParams={urlParams}
      date={date}
      setDate={setDate}
      postDataUpdateFlg={postDataUpdateFlg}
      setPostDataUpdateFlg={setPostDataUpdateFlg}
      joinUsers={joinUsers!}
      coverOpenFlg={coverOpenFlg}
      setCoverOpenFlg={setCoverOpenFlg}
    />
  );
}
