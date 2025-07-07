import { RoomMember } from "@prisma/client";
import "flatpickr/dist/flatpickr.min.css";
import { Dispatch, useCallback, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { DailyReportCommonUrlParams } from "@/pages/dailyReport/[...slug]";
import Calendar from "./Calendar";
import JoinUser from "./JoinUser";
import ModalMessageForm from "../common/ModalMessageForm";

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

/**
 * @description
 * カレンダーモーダル
 */
export default function ModalInformation({
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
  const [messageModalOpenFlg, setMessageModalOpenFlg] =
    useState<boolean>(false); // メッセージモーダルのオープンフラグ
  const [address, setAddress] = useState<number[]>([]); // 宛先

  const mFormOpenFunction = useCallback(() => {
    setModalTweetInfoOpenFlg(false);
    setMessageModalOpenFlg(true);
  }, [setMessageModalOpenFlg, setModalTweetInfoOpenFlg]);

  const mFormCloseFunction = useCallback(() => {
    setMessageModalOpenFlg(false);
    setModalTweetInfoOpenFlg(true);
  }, [setMessageModalOpenFlg, setModalTweetInfoOpenFlg]);

  return (
    <>
      <Modal
        show={modalTweetInfoOpenFlg}
        onHide={() => {
          setModalTweetInfoOpenFlg(false);
        }}
        centered
        size="lg"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-primary py-2"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex align-items-center">
            <MdOutlinePlaylistAdd />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Calendar
            urlParams={urlParams}
            date={date}
            setDate={setDate}
            postDataUpdateFlg={postDataUpdateFlg}
            setPostDataUpdateFlg={setPostDataUpdateFlg}
            modalTweetInfoOpenFlg={modalTweetInfoOpenFlg}
            setModalTweetInfoOpenFlg={setModalTweetInfoOpenFlg}
            coverOpenFlg={coverOpenFlg}
            setCoverOpenFlg={setCoverOpenFlg}
          />
          <JoinUser
            joinUsers={joinUsers!}
            setAddress={setAddress}
            mFormOpenFunction={mFormOpenFunction}
          />
        </Modal.Body>
      </Modal>
      <ModalMessageForm
        address={address}
        messageModalOpenFlg={messageModalOpenFlg}
        mFormCloseFunction={mFormCloseFunction}
      />
    </>
  );
}
