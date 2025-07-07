"use client";

import { EntryFlg, SettlementForm, TravelMethod } from "@/lib/constants";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import "flatpickr/dist/flatpickr.min.css";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import FlatPickr from "react-flatpickr";
import ModalPatternEntry from "./ModalPatternEntry";
import ModalPatternTranfer from "./ModalPatternTransfer";
import { PatternEntryData } from "./List";
import { Employee } from "@prisma/client";
import { useWindowSize } from "@/lib/useWindowSize";
import { MdCardTravel } from "react-icons/md";
import { editComma } from "@/utils/commonUtil";
import { BsQuestionCircle } from "react-icons/bs";

type Props = {
  entryModalOpenFlg: boolean;
  setEntryModalOpenFlg: React.Dispatch<React.SetStateAction<boolean>>;
  entryModalCloseFunction: VoidFunction | ((compFlg: boolean) => void);
  entryData: PatternEntryData | null;
  employee: Employee;
};

/**
 * @description
 * 旅費精算入力用のモーダル
 */
export default function ModalEntry({
  entryModalOpenFlg,
  setEntryModalOpenFlg,
  entryModalCloseFunction,
  entryData,
  employee,
}: Props) {
  const [targetDates, setTargetDates] = useState<Date[]>([]);
  const [settlementForm, setSettlementForm] = useState<string>(
    SettlementForm.trip.code
  );
  const [method, setMethod] = useState<string>(TravelMethod.oneWay.code);
  const [departure, setDeparture] = useState<string>("");
  const [arrival, setArrival] = useState<string | null>("");
  const [transportation, setTransportation] = useState<string | null>("");
  const [cost, setCost] = useState<string>("0");
  const [note, setNote] = useState<string | null>("");
  const [patternEntryData, setPatternEntryData] =
    useState<PatternEntryData | null>(null);

  const [patternEntryModalOpenFlg, setPatternEntryModalOpenFlg] =
    useState<boolean>(false);
  const [patternModalOpenFlg, setPatternModalOpenFlg] =
    useState<boolean>(false);

  const [width] = useWindowSize();

  // 入力候補リスト
  const [candidateTrans, setCandidateTrans] = useState<string[]>([]);
  const [candidateDeparture, setCandidateDeparture] = useState<string[]>([]);
  const [candidateArrival, setCandidateArrival] = useState<string[]>([]);
  const [candidateNote, setCandidateNote] = useState<string[]>([]);

  /** useEffect */
  useEffect(() => {
    const getInputCandidate = async () => {
      // モーダルが開いたときに実行
      if (entryModalOpenFlg && employee.id) {
        // 入力候補取得
        await axios
          .post("/api/settlement/get/candidate", {
            id: employee.id,
          })
          .then((res) => {
            // 入力候補リストにセット
            setCandidateTrans(res.data.candidateTransportation);
            setCandidateDeparture(res.data.candidateDeparture);
            setCandidateArrival(res.data.candidateArrival);
            setCandidateNote(res.data.candidateNote);
          });
      }
    };
    getInputCandidate();
  }, [entryModalOpenFlg, employee.id]);

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
    // パターン呼出を行った場合
    if (patternEntryData) {
      setTargetDates(entryData?.date ? [entryData.date] : targetDates);
      setSettlementForm(patternEntryData.form);
      setMethod(patternEntryData.method);
      setDeparture(patternEntryData.departure);
      setArrival(patternEntryData.arrival ?? "");
      setTransportation(patternEntryData.transportation ?? "");
      setCost(
        patternEntryData.cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      );
      setNote(patternEntryData.note ?? "");

      // 修正の場合
    } else if (entryData) {
      setTargetDates(entryData?.date ? [entryData.date] : []);
      setSettlementForm(entryData.form);
      setMethod(entryData.method);
      setDeparture(entryData.departure);
      setArrival(entryData.arrival ?? "");
      setTransportation(entryData.transportation ?? "");
      setCost(String(entryData.cost).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      setNote(entryData.note ?? "");
      setPatternEntryData(entryData);
    }
  };

  /** モーダルCLOSE処理 */
  const handleClose = (compFlg: boolean) => {
    // stateを初期化
    setTargetDates([]);
    setSettlementForm(SettlementForm.trip.code);
    setMethod(TravelMethod.oneWay.code);
    setDeparture("");
    setArrival("");
    setTransportation("");
    setCost("0");
    setNote("");
    setPatternEntryData(null);

    // 登録モーダルを閉じる
    entryModalCloseFunction(compFlg);
  };

  /** 参考料金表示（yahoo乗換案内） */
  const handleOpenPrice = () => {
    const encDeparture = encodeURIComponent(departure);
    const encArrival = encodeURIComponent(arrival || "");
    window.open(
      `https://transit.yahoo.co.jp/search/result?from=${encDeparture}&to=${encArrival}&ticket=ic`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /** 入力値クリア */
  const inputClear = () => {
    setMethod(TravelMethod.oneWay.code);
    setSettlementForm(SettlementForm.trip.code);
    setDeparture("");
    setArrival("");
    setTransportation("");
    setCost("0");
    setNote("");
  };

  /** データ登録/更新処理 */
  const handleSubmit = async () => {
    // パラメーターセット
    const data = {
      employeeId: employee.id,
      tno: entryData?.entryFlg === EntryFlg.update ? entryData.tno : null,
      displayNo: entryData?.displayNo,
      targetDate: targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      form: settlementForm,
      method: method,
      departure: departure,
      arrival: arrival,
      transportation: transportation,
      cost: cost.replace(/,/g, ""),
      note: note,
      entryFlg:
        entryData?.entryFlg === EntryFlg.update
          ? EntryFlg.update
          : EntryFlg.entry,
    };

    // 登録API呼び出し
    await axios.post("/api/settlement/entry", data);
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
    await axios.post("/api/settlement/entry", data);

    // モーダルを閉じる
    handleClose(true);
  };

  /** 移動/宿泊 方法変更処理 */
  const handleChangeMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // 移動/宿泊をセット
    setMethod(e.target.value);

    // 宿泊の場合、「着駅」「交通機関」をクリア
    if (e.target.value === TravelMethod.stay.code) {
      setArrival("");
      setTransportation("");
    }
  };

  /** 費用変更処理 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeCost = (e: React.ChangeEvent<any>) => {
    // 3桁カンマ区切りで費用をセット
    setCost(
      e.target.value.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );
  };

  /** パターン登録モーダルの活性・非活性判定 */
  const judgePatternEntry = () => {
    // 不正な金額形式の場合日活性
    if (!/^[0-9]*$/.test(cost?.replace(/,/g, ""))) {
      return true;
    }

    // 移動/宿泊パターンによる入力有無
    switch (method) {
      // 移動（片道）
      case TravelMethod.oneWay.code:
      // 移動（往復）
      case TravelMethod.roundTrip.code:
        return !(departure && arrival && transportation && cost);
      // 宿泊
      case TravelMethod.stay.code:
        return !(departure && cost);
      default:
        return true;
    }
  };

  /** カラーリング_登録・更新ボタン */
  const variantEntryButton = () => {
    switch (method) {
      case TravelMethod.oneWay.code:
      case TravelMethod.roundTrip.code:
        if (
          (targetDates?.length ?? 0) > 0 &&
          departure &&
          arrival &&
          transportation &&
          cost
        ) {
          if (entryData?.entryFlg === EntryFlg.update) {
            return "success";
          }
          return "primary";
        } else {
          return "secondary";
        }
      case TravelMethod.stay.code:
        if ((targetDates?.length ?? 0) > 0 && departure && cost) {
          return "primary";
        } else {
          return "secondary";
        }
    }
  };

  /** 活性制御‗登録・更新ボタン */
  const disableEntryButton = () => {
    switch (method) {
      case TravelMethod.stay.code:
        return !((targetDates?.length ?? 0) > 0 && departure && cost);
      default:
        return !(
          (targetDates?.length ?? 0) > 0 &&
          departure &&
          arrival &&
          transportation &&
          cost
        );
    }
  };

  /** パターン登録モーダルOPEN */
  const handleEntryPatternModalOpen = () => {
    setPatternEntryData({
      employeeId: employee.id,
      form: settlementForm,
      method: method,
      departure: departure,
      arrival: arrival,
      transportation: transportation,
      cost: Number(cost.replace(/,/g, "")),
      note: note,
    });
    setEntryModalOpenFlg(false);
    setPatternEntryModalOpenFlg(true);
  };

  /** パターン登録モーダルOPEN */
  const handleEntryPatternModalClose = useCallback(() => {
    setPatternEntryModalOpenFlg(false);
    setEntryModalOpenFlg(true);
  }, [setPatternEntryModalOpenFlg, setEntryModalOpenFlg]);

  /** パターン呼出モーダルOPEN */
  const handlePatternModalOpen = useCallback(() => {
    setEntryModalOpenFlg(false);
    setPatternModalOpenFlg(true);
  }, [setEntryModalOpenFlg, setPatternModalOpenFlg]);

  /** パターン呼出モーダルCLOSE */
  const handlePatternModalClose = useCallback(() => {
    setPatternModalOpenFlg(false);
    setEntryModalOpenFlg(true);
  }, [setPatternModalOpenFlg, setEntryModalOpenFlg]);

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
              <MdCardTravel />
              <span className="ms-2">旅費精算入力</span>
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
              <Form.Group className="d-flex justify-content-between mb-4">
                <div className="d-flex align-items-end flex-column">
                  <Button variant="outline-dark" onClick={inputClear}>
                    クリア
                  </Button>
                </div>
                <div>
                  <Button
                    variant={judgePatternEntry() ? "secondary" : "primary"}
                    onClick={handleEntryPatternModalOpen}
                    className="me-1"
                    disabled={judgePatternEntry()}
                  >
                    {width < 380 ? (
                      <span>pt登録</span>
                    ) : (
                      <span>パターン登録</span>
                    )}
                  </Button>
                  <Button variant="info" onClick={handlePatternModalOpen}>
                    {width < 380 ? (
                      <span>pt呼出</span>
                    ) : (
                      <span>パターン呼出</span>
                    )}
                  </Button>
                </div>
              </Form.Group>
            </Row>
            <Row>
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
              <Form.Group className="mb-2" as={Col}>
                <Form.Label className="d-flex align-items-center">
                  <span className="me-1">タイプ</span>
                  <SettlementFormInfo />
                </Form.Label>
                <Form.Select
                  value={settlementForm}
                  onChange={(e) => setSettlementForm(e.target.value)}
                >
                  {Object.values(SettlementForm).map((obj) => (
                    <option key={obj.code} value={obj.code}>
                      {obj.method}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-2" as={Col}>
                <Form.Label>移動/宿泊</Form.Label>
                <Form.Select
                  value={method}
                  onChange={(e) => handleChangeMethod(e)}
                >
                  {Object.values(TravelMethod).map((obj) => (
                    <option key={obj.code} value={obj.code}>
                      {obj.method}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2" as={Col}>
                <Form.Label>交通機関</Form.Label>
                <Form.Control
                  type="text"
                  value={transportation!}
                  onChange={(e) => setTransportation(e.target.value)}
                  placeholder="ex:東京メトロ"
                  disabled={method === TravelMethod.stay.code}
                  list="candidateTrans"
                />
                <datalist id="candidateTrans">
                  {candidateTrans.map((item, index) => (
                    <option key={index} value={item} />
                  ))}
                </datalist>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-2" as={Col}>
                <Form.Label>発駅/宿泊地</Form.Label>
                <Form.Control
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="ex:東京"
                  list="candidateDeparture"
                />
                <datalist id="candidateDeparture">
                  {candidateDeparture.map((item, index) => (
                    <option key={index} value={item} />
                  ))}
                </datalist>
              </Form.Group>
              <Form.Group className="mb-2" as={Col}>
                <Form.Label>着駅</Form.Label>
                <Form.Control
                  type="text"
                  value={arrival!}
                  onChange={(e) => setArrival(e.target.value)}
                  placeholder="ex:半蔵門"
                  disabled={method === TravelMethod.stay.code}
                  list="candidateArrival"
                />
                <datalist id="candidateArrival">
                  {candidateArrival.map((item, index) => (
                    <option key={index} value={item} />
                  ))}
                </datalist>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group
                className="mb-2 d-flex align-items-center justify-content-center"
                as={Col}
              >
                <Button
                  variant="info"
                  size="sm"
                  className=" w-100"
                  onClick={() => handleOpenPrice()}
                  disabled={departure && arrival ? false : true}
                >
                  参考料金
                </Button>
              </Form.Group>
              <Form.Group className="mb-2" as={Col}>
                <Form.Label>片道交通費/宿泊費</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    value={cost}
                    onClick={() => cost === "0" && setCost("")}
                    onBlur={(e) =>
                      setCost(
                        e.target.value ||
                          editComma(patternEntryData?.cost) ||
                          "0"
                      )
                    }
                    onChange={(e) => handleChangeCost(e)}
                    className="text-end"
                  />
                  <span className="ms-1">円</span>
                </div>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group className="mb-2" as={Col}>
                <Form.Label>備考</Form.Label>
                <Form.Control
                  type="text"
                  value={note!}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="補足情報を入力"
                  list="candidateNote"
                />
                <datalist id="candidateNote">
                  {candidateNote.map((item, index) => (
                    <option key={index} value={item} />
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
      <ModalPatternTranfer
        modalOpenFlg={patternModalOpenFlg}
        modalCloseFunction={handlePatternModalClose}
        setPatternEntryData={setPatternEntryData}
        employee={employee}
      />
      <ModalPatternEntry
        modalOpenFlg={patternEntryModalOpenFlg}
        modalCloseFunction={handleEntryPatternModalClose}
        patternEntryData={patternEntryData!}
      />
    </>
  );
}

/**
 * @description
 * 精算形態のtooltip
 */
function SettlementFormInfo() {
  const renderTooltip = (
    <Tooltip id="tooltip" className="custom-tooltip">
      【説明】
      <br />
      作業現場への通勤は「通勤」を選択してください。
      <br />
      それ以外の帰社、所用で本社に赴く場合などは「出張」を選択してください。
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 0, hide: 200 }}
      overlay={renderTooltip}
    >
      <Button
        variant="link"
        className="border-0 p-0 text-dark d-flex align-items-center"
        style={{ fontSize: "15px" }}
      >
        <BsQuestionCircle />
      </Button>
    </OverlayTrigger>
  );
}
