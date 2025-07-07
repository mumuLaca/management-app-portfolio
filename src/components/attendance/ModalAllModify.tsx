import { AbsentData, WorkStyle } from "@/lib/constants";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import "flatpickr/dist/flatpickr.min.css";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import React, { ChangeEvent, Dispatch, JSX, SetStateAction } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Row,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import FlatPickr from "react-flatpickr";
import { KeyedMutator } from "swr";
import TimeList15 from "../common/TimeList15";
import { getAbsentDataKey, getWorkStyleKey } from "@/utils/constantsUtil";
import { MESSAGE } from "../../lib/message";
import { TypeMonthlyAttendance } from "@/types/attendance";
import { Employee } from "@prisma/client";
import { BsWrenchAdjustableCircle } from "react-icons/bs";

type Props = {
  show: boolean;
  setModalShow: Dispatch<SetStateAction<boolean>>;
  employee: Employee;
  attendanceData: TypeMonthlyAttendance;
  mutateAttendance: KeyedMutator<TypeMonthlyAttendance>;
};

/**
 * @description
 * 一括修正用モーダル
 */
export default function ModalAllModify({
  show,
  setModalShow,
  employee,
  attendanceData,
  mutateAttendance,
}: Props) {
  const { yearMonth, list } = attendanceData;

  const [targetDates, setTargetDates] = React.useState<Date[]>([]);
  const [startTime, setStartTime] = React.useState<string>(employee.startTime);
  const [endTime, setEndTime] = React.useState<string>(employee.endTime);
  const [rest, setRest] = React.useState<string>("1.00");
  const [workStyle, setWorkStyle] = React.useState<string>(
    WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code
  );
  const [absentCode, setAbsentCode] = React.useState<string>(
    AbsentData.none.code
  );
  const [note, setNote] = React.useState<string>("");

  const [identificationModify, setIdentificationModify] =
    React.useState<boolean>(false);
  const [startTimeModify, setStartTimeModify] = React.useState<boolean>(false);
  const [endTimeModify, setEndTimeModify] = React.useState<boolean>(false);
  const [restModify, setRestModify] = React.useState<boolean>(false);
  const [workStyleModify, setWorkStyleModify] = React.useState<boolean>(false);
  const [absentCodeModify, setAbsentCodeModify] =
    React.useState<boolean>(false);
  const [noteModify, setNoteModify] = React.useState<boolean>(false);

  const [alert, setAlert] = React.useState<JSX.Element>(<></>);
  const [dispAttention, setDispAttention] = React.useState<boolean>(false);

  const firstDayOfMonth = dayjs(`${yearMonth}01`).startOf("month").toDate();
  const lastDayOfMonth = dayjs(`${yearMonth}01`).endOf("month").toDate();
  const noEntryDates = [];
  const enteredAlldayFalseDates = list
    .filter((item) => !AbsentData[getAbsentDataKey(item.absentCode)].allday)
    .map((item) => dayjs(item.date).format("YYYY-MM-DD"));
  const enteredDates = attendanceData.list.map((item) =>
    dayjs(item.date).format("YYYY-MM-DD")
  );

  // 未登録日付の配列を作成
  for (
    let target = dayjs(`${yearMonth}01`).startOf("month");
    target <= dayjs(`${yearMonth}01`).endOf("month");
    target = target.add(1, "day")
  ) {
    if (!enteredAlldayFalseDates.includes(target.format("YYYY-MM-DD"))) {
      noEntryDates.push(target.format("YYYY-MM-DD"));
    }
  }

  // ModalDOMに対するWarningが発生する為、モーダル専用Propsを作成
  // モーダルクローズ時の挙動
  const onHide = () => {
    setModalShow(false);

    setTargetDates([]);
    setStartTime(employee.startTime);
    setEndTime(employee.endTime);
    setRest("1.00");
    setWorkStyle(WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code);
    setAbsentCode(AbsentData.none.code);
    setNote("");

    setIdentificationModify(false);
    setStartTimeModify(false);
    setEndTimeModify(false);
    setRestModify(false);
    setWorkStyleModify(false);
    setAbsentCodeModify(false);
    setNoteModify(false);
  };
  const modalProps = { show, onHide };

  const hideElement = () => {
    setAlert(<></>);
  };

  // 一括修正
  const handleSubmit = async () => {
    const data = {
      id: employee.id,
      targetDate: !identificationModify
        ? enteredAlldayFalseDates
        : targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      startTime: startTimeModify ? startTime : "",
      endTime: endTimeModify ? endTime : "",
      rest: restModify ? rest : "",
      workStyle: workStyleModify ? workStyle : "",
      absentCode: absentCodeModify ? absentCode : "",
      note: noteModify ? note : "",
    };

    // 更新処理
    await axios
      .post("/api/attendance/update", data)
      .then(() => {
        // 表示の更新
        mutateAttendance();
        // モーダルをクローズ
        onHide();
      })
      .catch((err) => {
        setAlert(
          <Alert variant={MESSAGE.EM00000.kind}>
            {MESSAGE.EM00000.message}
          </Alert>
        );
        setTimeout(hideElement, 5000);
        console.error(err);
      });
  };

  // 一括削除
  const handleDelete = async () => {
    // 日付選択していない場合は登録済の日付全てが対象
    const data = {
      id: employee.id,
      targetDate: !identificationModify
        ? enteredDates
        : targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      deleteFlg: "1",
    };

    // 削除処理
    await axios.post("/api/attendance/entry", data);

    // 表示の更新
    mutateAttendance();
    // モーダルをクローズ
    onHide();
  };

  // 区分変更時
  const handleChangeaAbsent = (e: ChangeEvent<HTMLSelectElement>) => {
    setAbsentCode(e.target.value);

    if (AbsentData[getAbsentDataKey(e.target.value)].allday) {
      setStartTime(employee.startTime);
      setEndTime(employee.endTime);
      setRest("1.00");
      setWorkStyle(WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code);

      setStartTimeModify(false);
      setEndTimeModify(false);
      setRestModify(false);
      setWorkStyleModify(false);
    }
  };

  return (
    <>
      <Modal {...modalProps} centered>
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-dark"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex align-items-center">
            <BsWrenchAdjustableCircle />
            <span className="ms-2">一括修正</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{alert}</div>
          <Form>
            <Row className="mb-2">
              <Form.Group className="d-flex justify-content-between align-items-center">
                <Form.Switch
                  label="特定の日付のみ修正する"
                  onChange={() => {
                    setTargetDates([]);
                    setIdentificationModify(!identificationModify);
                  }}
                />
                <button
                  type="button"
                  className="bi bi-exclamation-diamond border px-2 py-1 bg-white rounded-pill"
                  onClick={() => setDispAttention(!dispAttention)}
                >
                  注意事項
                </button>
                <ToastContainer position="top-center">
                  <Toast
                    bg="light"
                    show={dispAttention}
                    onClose={() => setDispAttention(!dispAttention)}
                  >
                    <Toast.Header className="px-3">
                      <strong className="me-auto">注意事項</strong>
                    </Toast.Header>
                    <Toast.Body>
                      <div className="d-flex mb-2">
                        <span className="me-2">・</span>
                        <span>
                          修正したい項目にチェックと値を入れてください。
                        </span>
                      </div>
                      <div className="d-flex mb-2">
                        <span className="me-2">・</span>
                        <span>
                          休暇日を除いた登録済の日付全てを上書き修正します。&nbsp;※一括削除は休暇日も含みます。
                        </span>
                      </div>
                      <div className="d-flex mb-2">
                        <span className="me-2">・</span>
                        <span>休暇日の修正は個別に行ってください。</span>
                      </div>
                    </Toast.Body>
                  </Toast>
                </ToastContainer>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-3" as={Col}>
                <Form.Label>日付</Form.Label>
                <FlatPickr
                  disabled={!identificationModify}
                  value={!identificationModify ? "" : targetDates}
                  onChange={(value) => setTargetDates(value)}
                  className="form-control w-50"
                  options={{
                    disable: noEntryDates,
                    minDate: firstDayOfMonth,
                    maxDate: lastDayOfMonth,
                    dateFormat: "Y/m/d",
                    locale: Japanese,
                    mode: "multiple",
                  }}
                />
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-3" as={Col}>
                <div className="d-flex">
                  <Form.Label className="me-2">開始時刻</Form.Label>
                  <Form.Check
                    disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                    checked={startTimeModify}
                    onChange={() => {
                      setStartTime(employee.startTime);
                      setStartTimeModify(!startTimeModify);
                    }}
                  />
                </div>
                <Form.Control
                  type="time"
                  value={startTime}
                  list="data-list-start-15"
                  onChange={(e) => setStartTime(e.target.value)}
                  step={900}
                  disabled={!startTimeModify}
                />
              </Form.Group>
              <Form.Group className="mb-3" as={Col}>
                <div className="d-flex">
                  <Form.Label className="me-2">終了時刻</Form.Label>
                  <Form.Check
                    disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                    checked={endTimeModify}
                    onChange={() => {
                      setEndTime(employee.endTime);
                      setEndTimeModify(!endTimeModify);
                    }}
                  />
                </div>
                <Form.Control
                  type="time"
                  value={endTime}
                  list="data-list-end-15"
                  onChange={(e) => setEndTime(e.target.value)}
                  step={900}
                  disabled={!endTimeModify}
                />
              </Form.Group>
              <Form.Group className="mb-3" as={Col}>
                <div className="d-flex">
                  <Form.Label className="me-2">休憩</Form.Label>
                  <Form.Check
                    disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                    checked={restModify}
                    onChange={() => {
                      setRest("1.00");
                      setRestModify(!restModify);
                    }}
                  />
                </div>
                <Form.Control
                  type="number"
                  value={rest}
                  onChange={(e) => setRest(e.target.value)}
                  placeholder="ex:1.00"
                  step="0.25"
                  disabled={!restModify}
                />
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-3" as={Col}>
                <div className="d-flex">
                  <Form.Label className="me-2">勤務形態</Form.Label>
                  <Form.Check
                    disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                    checked={workStyleModify}
                    onChange={() => {
                      setWorkStyle(
                        WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code
                      );
                      setWorkStyleModify(!workStyleModify);
                    }}
                  />
                </div>
                <Form.Select
                  value={workStyle}
                  onChange={(e) => setWorkStyle(e.target.value)}
                  disabled={!workStyleModify}
                >
                  {Object.values(WorkStyle).map((obj) => (
                    <option key={obj.code} value={obj.code}>
                      {obj.mean}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" as={Col}>
                <div className="d-flex">
                  <Form.Label className="me-2">区分</Form.Label>
                  <Form.Check
                    checked={absentCodeModify}
                    onChange={() => {
                      setAbsentCode(AbsentData.none.code);
                      setAbsentCodeModify(!absentCodeModify);
                    }}
                  />
                </div>
                <Form.Select
                  value={absentCode}
                  onChange={(e) => handleChangeaAbsent(e)}
                  disabled={!absentCodeModify}
                >
                  {Object.values(AbsentData).map((ab) => (
                    <option key={ab.code} value={ab.code}>
                      {ab.caption}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <Row>
              <Form.Group className="mb-4" as={Col}>
                <div className="d-flex">
                  <Form.Label className="me-2">備考</Form.Label>
                  <Form.Check
                    checked={noteModify}
                    onChange={() => {
                      setNote("");
                      setNoteModify(!noteModify);
                    }}
                  />
                </div>
                <Form.Control
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="休暇等の補足情報"
                  disabled={!noteModify}
                />
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <div>
            <Button
              disabled={identificationModify && targetDates.length === 0}
              variant={
                identificationModify && targetDates.length === 0
                  ? "secondary"
                  : "danger"
              }
              onClick={handleDelete}
              size="lg"
            >
              一括削除
            </Button>
          </div>
          <div>
            <Button
              disabled={
                (identificationModify && targetDates.length === 0) ||
                enteredAlldayFalseDates.length === 0
              }
              variant={
                (identificationModify && targetDates.length === 0) ||
                enteredAlldayFalseDates.length === 0
                  ? "secondary"
                  : "primary"
              }
              onClick={handleSubmit}
              className="px-5"
              size="lg"
            >
              一括登録
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <TimeList15 />
    </>
  );
}
