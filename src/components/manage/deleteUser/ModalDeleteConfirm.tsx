"use client";

import { Employee } from "@prisma/client";
import axios from "axios";
import React, { Dispatch, SetStateAction } from "react";
import { Button, Modal } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";

interface Props {
  show: boolean;
  deleteEmployee: Employee;
  setModalShow: Dispatch<SetStateAction<boolean>>;
}

/**
 * @description
 * 社員情報削除時の確認モーダル
 *
 * 社員情報削除時、削除確認のモーダルを表示する。
 */
export default function ModalDeleteConfirm({
  show,
  deleteEmployee,
  setModalShow,
}: Props) {
  /** モーダルクローズ処理 */
  const onHide = () => {
    setModalShow(false);
  };

  /** 削除処理 */
  const deleteHandler = async () => {
    await axios.delete(`/api/employee/delete/${deleteEmployee.id}`);

    // ページをリロード
    window.location.reload();
  };

  return (
    <div>
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-danger"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex align-items-center">
            <BsExclamationTriangle />
            <span className="ps-2">削除します。よろしいですか？</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <dl style={{ fontSize: "22px" }}>
              <dt>社員番号</dt>
              <dd className="ms-5">{deleteEmployee.id}</dd>
              <dt>名前</dt>
              <dd className="ms-5">{deleteEmployee.name}</dd>
            </dl>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            className="fw-bold"
            size="lg"
            onClick={deleteHandler}
          >
            削除
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setModalShow(false)}
          >
            キャンセル
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
