"use client";

import { MODALMESSAGEKINDCOLOR } from "@/lib/modalMessage";
import React, { Dispatch, SetStateAction } from "react";
import { Button, Modal } from "react-bootstrap";
import parse from "html-react-parser";

type Props = {
  modalMessage: ModalMessage;
  show: boolean;
  setModalShow: Dispatch<SetStateAction<boolean>>;
  executeFunction: () => void;
};

/**
 * @description
 * 共通モーダル
 *
 * 親コンポーネントより渡されたmodalMessageを基にModalを表示する。
 */
export default function ModalConfirm({
  modalMessage,
  show,
  setModalShow,
  executeFunction,
}: Props) {
  /** モーダルクローズ処理 */
  const onHide = () => {
    setModalShow(false);
  };
  const modalProps = { show, onHide };

  /** 実行処理 */
  const clickHandler = async () => {
    // 呼出元で定義した関数を実行
    executeFunction();
    // モーダルを閉じる
    onHide();
  };

  return (
    <div>
      <Modal {...modalProps} centered>
        <Modal.Header
          closeButton={modalMessage.closeBtnPresence}
          closeVariant="white"
          className={MODALMESSAGEKINDCOLOR[modalMessage.kind].backgroundColor}
          style={{ color: "#fff" }}
        >
          <Modal.Title>
            <i className={MODALMESSAGEKINDCOLOR[modalMessage.kind].icon}></i>
            <span className="ms-2">{modalMessage.title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{parse(modalMessage.message)}</div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          {modalMessage.btn2.dispOn && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setModalShow(false)}
            >
              {modalMessage.btn2.words}
            </Button>
          )}
          {modalMessage.btn1.dispOn ? (
            <Button
              variant={MODALMESSAGEKINDCOLOR[modalMessage.kind].btnColor}
              className="fw-bold"
              size="lg"
              style={{ color: "#fff" }}
              onClick={clickHandler}
            >
              {modalMessage.btn1.words}
            </Button>
          ) : (
            <></>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
