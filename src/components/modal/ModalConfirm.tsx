"use client";

import { MODALMESSAGEKINDCOLOR } from "@/lib/modalMessage";
import React, { Dispatch, SetStateAction } from "react";
import parse from "html-react-parser";
import type { ModalMessage } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  /** 実行処理 */
  const clickHandler = async () => {
    // 呼出元で定義した関数を実行
    executeFunction();
    // モーダルを閉じる
    onHide();
  };

  return (
    <div>
      <Dialog open={show} onOpenChange={onHide}>
        <DialogContent>
          <DialogHeader
            className={MODALMESSAGEKINDCOLOR[modalMessage.kind].backgroundColor}
            style={{ color: "#fff" }}
          >
            <DialogTitle>
              <i className={MODALMESSAGEKINDCOLOR[modalMessage.kind].icon}></i>
              <span className="ms-2">{modalMessage.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div>{parse(modalMessage.message)}</div>
          </div>
          <DialogFooter className="flex justify-between">
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
                variant={
                  MODALMESSAGEKINDCOLOR[modalMessage.kind].btnColor ===
                  "success"
                    ? "default"
                    : "destructive"
                }
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
