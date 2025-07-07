"use client";

import { SettlementForm, TravelMethod } from "@/lib/constants";
import axios from "axios";
import React from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import "flatpickr/dist/flatpickr.min.css";
import {
  getSettlementFormKey,
  getTravelMethodKey,
} from "@/utils/constantsUtil";
import { PatternEntryData } from "./List";
import { BsBookmarkPlus, BsGeoFill } from "react-icons/bs";

type Props = {
  modalOpenFlg: boolean; // 表示判定
  modalCloseFunction: VoidFunction; // モーダルCLOSE時処理
  patternEntryData: PatternEntryData;
};

/**
 * @description
 * 旅費精算パターン登録用モーダル
 */
export default function ModalPatternEntry({
  modalOpenFlg,
  modalCloseFunction,
  patternEntryData,
}: Props) {
  const [title, setTitle] = React.useState<string>("");
  const [alert, setAlert] = React.useState<boolean>(false);

  /** 経路を表示 */
  const setDetail = () => {
    if (!patternEntryData) return;

    const { method, departure, arrival } = patternEntryData;

    switch (method) {
      case TravelMethod.oneWay.code:
        return (
          <span>
            {departure}⇒{arrival}
          </span>
        );
      case TravelMethod.roundTrip.code:
        return (
          <span>
            {departure}⇔{arrival}
          </span>
        );
      case TravelMethod.stay.code:
        return <span>{departure}</span>;
      default:
        return <span></span>;
    }
  };

  /** パターン登録処理 */
  const handleEntry = async () => {
    // パラメーターを設定
    const requestData = {
      ...patternEntryData,
      title: title || "無題",
    };

    // API発行
    const response = await axios.post(
      "/api/settlement/pattern/entry",
      requestData
    );

    // ステータスコードが200のとき
    if (response.status === 200) {
      setAlert(true);

      // 1秒後にモーダルを閉じる
      setTimeout(() => {
        setTitle("");
        setAlert(false);
        modalCloseFunction();
      }, 1000);
    }
  };

  /** モーダルを閉じる */
  const onHide = () => {
    setTitle("");
    modalCloseFunction();
  };

  return (
    <>
      <Modal show={modalOpenFlg} onHide={onHide} centered>
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-success"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex w-100 align-items-center">
            <BsBookmarkPlus />
            <span className="ms-2">パターン登録</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert ? (
            <Alert variant="success">登録が完了しました。</Alert>
          ) : (
            <></>
          )}
          <Form.Group className="mb-3">
            <Form.Label>パターン名を記入してください。</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex:帰社経路"
            />
          </Form.Group>
          <Card bg="light">
            <Card.Body className="px-0">
              <Card.Title className="d-flex justify-content-between px-0 pb-3">
                <span className="fs-6">
                  {`【${
                    SettlementForm[getSettlementFormKey(patternEntryData?.form)]
                      .method
                  }】${
                    TravelMethod[getTravelMethodKey(patternEntryData?.method)]
                      .method
                  }`}
                </span>
                <span className="pe-3 fs-6">
                  {patternEntryData?.transportation ? (
                    <>
                      <BsGeoFill />
                      {patternEntryData?.transportation}
                    </>
                  ) : (
                    <></>
                  )}
                </span>
              </Card.Title>
              <Card.Text
                className="w-100 fs-1 px-5"
                style={{ textAlignLast: "justify" }}
              >
                {setDetail()}
              </Card.Text>
              <Card.Text className="text-center fs-1">
                <span>
                  {`${String(patternEntryData?.cost).replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )}円`}
                </span>
              </Card.Text>
              <Card.Text className="text-end fs-6 pe-2">
                <span>
                  {patternEntryData?.note ? (
                    <>{`備考 : ${patternEntryData?.note}`}</>
                  ) : (
                    <></>
                  )}
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" size="lg" onClick={onHide}>
            戻る
          </Button>
          <Button variant="success" size="lg" onClick={() => handleEntry()}>
            登録
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
