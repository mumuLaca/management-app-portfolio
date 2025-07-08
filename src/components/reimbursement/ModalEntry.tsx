"use client";

import { EntryFlg } from "@/lib/constants";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import "flatpickr/dist/flatpickr.min.css";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import FlatPickr from "react-flatpickr";
import { PatternEntryData } from "./List";
import { Employee } from "@prisma/client";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { editComma } from "@/utils/commonUtil";

type Props = {
  entryModalOpenFlg: boolean;
  entryModalCloseFunction: VoidFunction | ((compFlg: boolean) => void);
  entryData: PatternEntryData | null;
  employee: Employee;
};

/**
 * @description
 * 立替精算入力用のモーダル
 */
export default function ModalEntry({
  entryModalOpenFlg,
  entryModalCloseFunction,
  entryData,
  employee,
}: Props) {
  const [targetDates, setTargetDates] = useState<Date[]>([]); // 日付
  const [contents, setContents] = useState<string>(""); // 内容
  const [paidTo, setPaidTo] = useState<string>(""); // 支払先
  const [cost, setCost] = useState<string>("0"); // 費用
  const [note, setNote] = useState<string>(""); // 備考
  const [invoiceFlg, setInvoiceFlg] = useState<boolean>(true); // インボイス登録番号
  // 入力候補
  const [candidateContents, setCandidateContents] = useState<string[]>([]); // 内容/目的
  const [candidatePaidTo, setCandidatePaidTo] = useState<string[]>([]); // 支払先
  const [candidateNote, setCandidateNote] = useState<string[]>([]); // 備考

  /** useEffect */
  useEffect(() => {
    const getInputCandidate = async () => {
      // モーダルが開いたときに実行
      if (entryModalOpenFlg && employee.id) {
        // 入力候補取得
        await axios
          .post("/api/reimbursement/get/candidate", {
            id: employee.id,
          })
          .then((res) => {
            // 入力候補リストにセット
            setCandidateContents(res.data.candidateContents);
            setCandidatePaidTo(res.data.candidatePaidTo);
            setCandidateNote(res.data.candidateNote);
          });
      }
    };

    getInputCandidate();
  }, [entryModalOpenFlg, employee.id]);

  // 月初日‗String
  const firstDayOfMonthStr = entryData?.yearMonth
    ? entryData?.yearMonth + "01"
    : null;
  // 月初日
  const firstDayOfMonth = dayjs(firstDayOfMonthStr ?? new Date())
    .startOf("month")
    .toDate();
  // 月末日
  const lastDayOfMonth = dayjs(firstDayOfMonthStr ?? new Date())
    .endOf("month")
    .toDate();

  /** モーダル初期表示処理 */
  const onShow = () => {
    // 修正の場合
    if (entryData) {
      setTargetDates(entryData?.date ? [entryData.date] : []);
      setContents(entryData.contents);
      setInvoiceFlg(entryData.invoiceFlg ?? false);
      setPaidTo(entryData.paidTo);
      setCost(editComma(entryData.cost));
      setNote(entryData.note ?? "");
    }
  };

  /** モーダルCLOSE処理 */
  const handleClose = (compFlg: boolean) => {
    // stateを初期化
    setTargetDates([]);
    setContents("");
    setPaidTo("");
    setCost("0");
    setNote("");

    // 登録モーダルを閉じる
    entryModalCloseFunction(compFlg);
  };

  /** 入力値クリア */
  const inputClear = () => {
    setContents("");
    setInvoiceFlg(true);
    setPaidTo("");
    setCost("0");
    setNote("");
  };

  /** データ登録/更新処理 */
  const handleSubmit = async () => {
    // パラメーターセット
    const data = {
      employeeId: employee.id,
      tno: entryData?.entryFlg === EntryFlg.update ? entryData?.tno : null,
      targetDate: targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      contents: contents,
      paidTo: paidTo,
      cost: cost.replace(/,/g, ""),
      note: note,
      entryFlg:
        entryData?.entryFlg === EntryFlg.update
          ? EntryFlg.update
          : EntryFlg.entry,
      invoiceFlg: invoiceFlg,
    };

    // 登録API呼び出し
    await axios.post("/api/reimbursement/entry", data);
    // モーダルを閉じる
    handleClose(true);
  };

  /** データ削除処理 */
  const handleDelete = async () => {
    // パラメーターセット
    const data = {
      employeeId: employee.id,
      tno: entryData!.tno,
      targetDate: targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      entryFlg: EntryFlg.delete,
    };

    // 削除API呼び出し
    await axios.post("/api/reimbursement/entry", data);

    // モーダルを閉じる
    handleClose(true);
  };

  /** 費用変更処理 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeCost = (e: ChangeEvent<any>) => {
    // 3桁カンマ区切りで費用をセット
    setCost(
      e.target.value.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );
  };

  /** カラーリング_登録・更新ボタン */
  const variantEntryButton = () => {
    if (
      (targetDates?.length ?? 0) > 0 &&
      contents &&
      paidTo &&
      cost &&
      cost !== "0"
    ) {
      if (entryData?.entryFlg === EntryFlg.update) {
        return "success";
      }
      return "primary";
    } else {
      return "secondary";
    }
  };

  /** 活性制御‗登録・更新ボタン */
  const disableEntryButton = () => {
    return !(
      (targetDates?.length ?? 0) > 0 &&
      contents &&
      paidTo &&
      cost &&
      cost !== "0"
    );
  };

  return (
    <>
      <Modal
        show={entryModalOpenFlg}
        onShow={onShow}
        onHide={() => handleClose(false)}
        centered
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-primary"
          style={{ color: "#fff" }}
        >
          <Modal.Title>
            <div className="text-nowrap">
              <AiOutlineMoneyCollect />
              <span className="ms-2">立替精算入力</span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {cost && !/^[0-9]*$/.test(cost?.replace(/,/g, "")) && (
              <Row>
                <Alert variant="danger">費用は半角数字で入力して下さい</Alert>
              </Row>
            )}
          </div>
          <Form>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-2" as={Col}>
                  <Form.Label>日付</Form.Label>
                  <FlatPickr
                    value={targetDates}
                    onChange={(value) => setTargetDates(value)}
                    className="form-control"
                    options={{
                      minDate: firstDayOfMonth,
                      maxDate: lastDayOfMonth,
                      dateFormat: "Y/m/d",
                      locale: Japanese,
                      mode: "multiple",
                    }}
                    disabled={
                      entryData?.entryFlg === EntryFlg.update ? true : false
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="d-flex justify-content-end">
                  <Button variant="outline-dark" onClick={inputClear}>
                    クリア
                  </Button>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-2" as={Col}>
                  <Form.Label>目的/内容</Form.Label>
                  <Form.Control
                    type="text"
                    value={contents}
                    onChange={(e) => setContents(e.target.value)}
                    placeholder="ex:面談、接待"
                    list="contentsList"
                  />
                  <datalist id="contentsList">
                    {candidateContents.map((item) => (
                      <option value={item} key={item}></option>
                    ))}
                  </datalist>
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-2" as={Col}>
                  <Form.Label>インボイス登録番号</Form.Label>
                  <Form.Check // prettier-ignore
                    type="switch"
                    label="有り"
                    className="mt-1"
                    checked={invoiceFlg}
                    onChange={() => setInvoiceFlg(!invoiceFlg)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-2" as={Col}>
                  <Form.Label>支払先</Form.Label>
                  <Form.Control
                    type="text"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="支払先を入力"
                    list="paidToList"
                  />
                  <datalist id="paidToList">
                    {candidatePaidTo.map((item) => (
                      <option value={item} key={item}></option>
                    ))}
                  </datalist>
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-2" as={Col}>
                  <Form.Label>金額</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      value={cost}
                      onClick={() => cost === "0" && setCost("")}
                      onBlur={(e) =>
                        setCost(
                          e.target.value || editComma(entryData?.cost) || "0"
                        )
                      }
                      onChange={(e) => handleChangeCost(e)}
                      className="text-end"
                    />
                    <span className="ms-1">円</span>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Form.Group className="mb-2" as={Col}>
                <Form.Label>備考（参加者等）</Form.Label>
                <Form.Control
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="補足情報を入力"
                  list="candidateNote"
                />
                <datalist id="candidateNote">
                  {candidateNote.map((item) => (
                    <option value={item} key={item}></option>
                  ))}
                </datalist>
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          {entryData?.entryFlg === EntryFlg.update ? (
            <div>
              <Button variant="danger" onClick={handleDelete} size="lg">
                削除
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="secondary"
                onClick={() => handleClose(false)}
                size="lg"
              >
                戻る
              </Button>
            </div>
          )}
          <div>
            <Button
              onClick={handleSubmit}
              className="px-5"
              size="lg"
              variant={variantEntryButton()}
              disabled={disableEntryButton()}
            >
              {entryData?.entryFlg === EntryFlg.update ? "修正" : "登録"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
