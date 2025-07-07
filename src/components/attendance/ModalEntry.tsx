"use client";

import {
  AbsentData,
  SettlementForm,
  TravelMethod,
  WorkStyle,
} from "@/lib/constants";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import "flatpickr/dist/flatpickr.min.css";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import FlatPickr from "react-flatpickr";
import TimeList15 from "../common/TimeList15";
import { getAbsentDataKey } from "@/utils/constantsUtil";
import { TypeAttendanceItem } from "@/types/attendance";
import SettlementEntryModal from "../settlement/ModalEntry";
import { PatternEntryData } from "../settlement/List";
import { Employee } from "@prisma/client";
import { MESSAGE } from "@/lib/message";
import { TbFileReport } from "react-icons/tb";

type Props = {
  entryModalOpenFlg: boolean;
  setEntryModalOpenFlg: React.Dispatch<React.SetStateAction<boolean>>;
  entryModalCloseFunction: VoidFunction;
  entryItem: TypeAttendanceItem | null;
  employee: Employee;
};

/**
 * @description
 * 勤務時間入力モーダル
 */
export default function ModalEntry({
  entryModalOpenFlg,
  setEntryModalOpenFlg,
  entryModalCloseFunction,
  entryItem,
  employee,
}: Props) {
  const [targetDates, setTargetDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [rest, setRest] = useState<string>("");
  const [workStyle, setWorkStyle] = useState<string>(WorkStyle.office.code);
  const [absentCode, setAbsentCode] = useState<string>(AbsentData.none.code);
  const [note, setNote] = useState<string>("");
  const [settlementEntryFlg, setSettlementEntryFlg] = useState<boolean>(false);
  const [settlementData, setSettlementData] = useState<PatternEntryData | null>(
    null
  );
  const [settlementEntryCompFlg, setSettlementEntryCompFlg] =
    useState<boolean>(false);

  // 入力候補リスト
  const [candidateNote, setCandidateNote] = useState<string[]>([]);

  /** useEffect */
  useEffect(() => {
    const getInputCandidate = async () => {
      // モーダルが開いたときに実行
      if (entryModalOpenFlg && employee.id) {
        // 入力候補取得
        await axios
          .post("/api/attendance/get/candidate", {
            id: employee.id,
          })
          .then((res) => {
            // 入力候補リストにセット
            setCandidateNote(res.data.candidateNote);
          });
      }
    };
    getInputCandidate();
  }, [entryModalOpenFlg, employee.id]);

  // 月初日
  const firstDayOfMonth = dayjs(entryItem?.date).startOf("month").toDate();
  // 月末日
  const lastDayOfMonth = dayjs(entryItem?.date).endOf("month").toDate();

  /** モーダル初期表示処理 */
  const onShow = () => {
    if (entryItem === null) {
      return;
    }

    // DBに登録済の日付の場合は、登録済のデータをセット
    setTargetDates([new Date(entryItem.date)]);
    setStartTime(entryItem.startTime);
    setEndTime(entryItem.endTime);
    setRest(entryItem.rest);
    setWorkStyle(WorkStyle[entryItem.workStyle].code);
    setAbsentCode(entryItem.absentCode || "000");
    setNote(entryItem.note);

    // DBに未登録の日付の場合は、プロフィールで設定した値をセット
    if (entryItem.empty) {
      setStartTime(employee.startTime);
      setEndTime(employee.endTime);
      setWorkStyle(employee.basicWorkStyle);
      setRest("1.00");
    }
  };

  /** 入力値クリアボタン押下時処理 */
  const inputClear = () => {
    setStartTime("");
    setEndTime("");
    setRest("");
    setWorkStyle(WorkStyle.none.code);
  };

  /** モーダルクローズ時処理 */
  const handleCloseModal = () => {
    inputClear();
    setTargetDates([]);
    setAbsentCode(AbsentData.none.code);
    setNote("");
    setEntryModalOpenFlg(false);
  };

  /** DB登録処理 */
  const handleSubmit = async () => {
    // パラメーターをセット
    const data = {
      id: employee.id,
      targetDate: targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      startTime: startTime,
      endTime: endTime,
      rest: rest,
      workStyle: workStyle,
      absentCode: absentCode,
      note: note,
      deleteFlg: "0",
    };

    // 登録処理APIを呼び出し
    await axios.post("/api/attendance/entry", data);

    // モーダルを閉じる
    entryModalCloseFunction();
  };

  /** 削除処理 */
  const handleDelete = async () => {
    // パラメーターをセット
    const data = {
      id: employee.id,
      targetDate: targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      deleteFlg: "1",
    };

    // 削除処理APIを呼び出し
    await axios.post("/api/attendance/entry", data);

    // モーダルを閉じる
    entryModalCloseFunction();
  };

  /** 区分変更時処理 */
  const handleChangeAbsent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAbsentCode(e.target.value);

    // 不就業区分が「終日」であれば時刻と休憩時間をクリアする
    if (
      Object.values(AbsentData).find(
        (ab) =>
          ab.code === e.target.value &&
          (ab.allday === true || ab.code === AbsentData.companyEvent.code)
      )
    ) {
      setWorkStyle(WorkStyle.none.code);
      setStartTime("");
      setEndTime("");
      setRest("");
    }
  };

  /** 交通費精算モーダルを開く */
  const handleSettlementModalOpen = () => {
    // 交通費精算情報の初期値を設定
    setSettlementData({
      employeeId: employee.id,
      date: new Date(entryItem!.date),
      form: SettlementForm.commuter.code,
      method: TravelMethod.oneWay.code,
      departure: "",
      arrival: "",
      transportation: "",
      cost: 0,
      note: "",
    });
    // 交通費精算モーダルを開く
    handleCloseModal();
    // 勤務表モーダルを閉じる
    setSettlementEntryFlg(true);
  };

  /** 交通費精算登録モーダルを閉じる */
  const handleSettlementModalClose = useCallback(
    (comFlg: boolean) => {
      setSettlementEntryCompFlg(comFlg); // 登録完了メッセージを表示
      setSettlementEntryFlg(false); // 交通費精算モーダルを閉じる
      setEntryModalOpenFlg(true); // 勤務表モーダルを開く

      // 2秒後に登録完了メッセージを閉じる
      setTimeout(() => setSettlementEntryCompFlg(false), 2000);
    },
    [setSettlementEntryCompFlg, setSettlementEntryFlg, setEntryModalOpenFlg]
  );

  return (
    <>
      <Modal
        show={entryModalOpenFlg}
        onShow={onShow}
        onHide={handleCloseModal}
        centered
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-primary"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex justify-content-between w-100 align-items-center">
            <div>
              <TbFileReport />
              <span className="ms-2">勤務表入力</span>
            </div>
            <div className="text-end me-3">
              <Button variant="success" onClick={handleSettlementModalOpen}>
                交通費精算登録
              </Button>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {settlementEntryCompFlg && (
            <Row>
              <Alert variant={MESSAGE.SM0001.kind}>
                {MESSAGE.SM0001.message}
              </Alert>
            </Row>
          )}
          <Form>
            <Row>
              <Form.Group className="mb-3" as={Col}>
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
                />
              </Form.Group>
              <Form.Group className="mb-3" as={Col}>
                <div className="d-flex align-items-end flex-column">
                  <Button variant="outline-dark" onClick={inputClear}>
                    クリア
                  </Button>
                </div>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-3" as={Col}>
                <Form.Label>開始時刻</Form.Label>
                <Form.Control
                  type="time"
                  value={startTime}
                  list="data-list-start-15"
                  onChange={(e) => setStartTime(e.target.value)}
                  step={900}
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                />
              </Form.Group>
              <Form.Group className="mb-3" as={Col}>
                <Form.Label>終了時刻</Form.Label>
                <Form.Control
                  type="time"
                  value={endTime}
                  list="data-list-end-15"
                  onChange={(e) => setEndTime(e.target.value)}
                  step={900}
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                />
              </Form.Group>
              <Form.Group className="mb-3" as={Col}>
                <Form.Label>休憩(H)</Form.Label>
                <Form.Control
                  type="number"
                  inputMode="decimal"
                  value={rest}
                  onChange={(e) => setRest(e.target.value)}
                  placeholder="ex:1.00"
                  step="0.25"
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                />
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-3" as={Col}>
                <Form.Label>勤務形態</Form.Label>
                <Form.Select
                  value={workStyle}
                  onChange={(e) => setWorkStyle(e.target.value)}
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                >
                  {Object.values(WorkStyle).map((obj) => (
                    <option key={obj.code} value={obj.code}>
                      {obj.mean}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" as={Col}>
                <Form.Label>区分</Form.Label>
                <Form.Select value={absentCode} onChange={handleChangeAbsent}>
                  {Object.values(AbsentData)
                    .filter((obj) => obj.code !== "700")
                    .map((ab) => (
                      <option key={ab.code} value={ab.code}>
                        {ab.caption}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <Row>
              <Form.Group className="mb-3" as={Col}>
                <Form.Label>備考</Form.Label>
                <Form.Control
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="休暇等の補足情報"
                  list="candidateNote"
                />
                <datalist id="candidateNote">
                  {candidateNote.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <div>
            <Button
              variant={entryItem?.empty ? "secondary" : "danger"}
              onClick={handleDelete}
              disabled={entryItem?.empty ? true : false}
              size="lg"
            >
              削除
            </Button>
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="px-5"
              size="lg"
            >
              登録
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <TimeList15 />
      <SettlementEntryModal
        entryModalOpenFlg={settlementEntryFlg}
        setEntryModalOpenFlg={setSettlementEntryFlg}
        entryModalCloseFunction={handleSettlementModalClose}
        entryData={settlementData}
        employee={employee}
      />
    </>
  );
}
