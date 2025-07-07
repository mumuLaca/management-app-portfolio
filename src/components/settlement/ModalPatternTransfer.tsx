import { TravelMethod } from "@/lib/constants";
import { Employee, SettlementPattern } from "@prisma/client";
import axios from "axios";
import React, { JSX, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import useSWR, { Fetcher } from "swr";
import "flatpickr/dist/flatpickr.min.css";
import { PatternEntryData } from "./List";
import { useWindowSize } from "@/lib/useWindowSize";
import { BsBookmarkCheck } from "react-icons/bs";

type Props = {
  modalOpenFlg: boolean; // 表示判定
  modalCloseFunction: VoidFunction; // モーダルCLOSE時処理
  setPatternEntryData: React.Dispatch<PatternEntryData>;
  employee: Employee;
};

const fetcher: Fetcher<SettlementPattern[], string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * 旅費精算入力用のモーダル
 */
export default function ModalPatternTranfer({
  modalOpenFlg,
  modalCloseFunction,
  setPatternEntryData,
  employee,
}: Props) {
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [compMsg, setCompMsg] = useState<string>("");
  const [width] = useWindowSize();

  // リスト情報をDBから取得
  const { data, error, mutate, isLoading } = useSWR(
    `/api/settlement/pattern/get/${employee.id}`,
    fetcher
  );

  // useSWRによるデータ取得が失敗した場合
  if (error) {
    console.error(error);
    return <></>;
  }

  /** モーダルOPEN処理 */
  const onShow = () => {
    // データの最新化
    mutate();
  };

  /** モーダルCLOSE処理 */
  const handleClose = () => {
    setCompMsg("");
    // モーダルを閉じる
    modalCloseFunction();
  };

  /** 概要の編集 */
  const setOverview = (index: number): JSX.Element => {
    if (!data) return <></>;

    const { method, departure, arrival, transportation, cost } = data[index];
    const commaCost = String(cost).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    switch (method) {
      case TravelMethod.oneWay.code:
        return (
          <>
            {departure}⇒{arrival}
            <br />({transportation}片道{commaCost}円)
          </>
        );
      case TravelMethod.roundTrip.code:
        return (
          <>
            {departure}⇔{arrival}
            <br />({transportation}往復{commaCost}円)
          </>
        );
      case TravelMethod.stay.code:
        return (
          <>
            {departure}宿泊{commaCost}円
          </>
        );
      default:
        return <></>;
    }
  };

  /** 適用ボタンクリック */
  const handleApply = (data: SettlementPattern) => {
    const entryData = {
      employeeId: data.employeeId,
      date: null,
      form: data.form,
      method: data.method,
      departure: data.departure,
      arrival: data.arrival,
      transportation: data.transportation,
      cost: data.cost,
      note: data.note,
    };

    setPatternEntryData(entryData);
    handleClose();
  };

  /** 削除ボタンクリック開始 */
  const handlePressStart = () => {
    const startTime = Date.now();
    setPressStartTime(startTime); // 長押し開始時間を記録

    setTimeout(() => {
      // 削除メッセージ
      setCompMsg("削除！");
    }, 1500);
  };

  /** 削除ボタンクリック終了 */
  const handlePressEnd = async (data: SettlementPattern) => {
    if (pressStartTime !== null) {
      const duration = Date.now() - pressStartTime;

      // 長押しで削除処理実行
      if (duration >= 1500) {
        // API発行
        await axios
          .post("/api/settlement/pattern/delete", {
            employeeId: data.employeeId,
            tno: data.tno,
          })
          .then(() => {
            // 表示更新
            mutate();
          })
          .finally(() =>
            // 1秒後にメッセージ削除
            setTimeout(() => {
              setCompMsg("");
            }, 1000)
          );
      }
    }
    // 開始時刻を初期化
    setPressStartTime(null);
  };

  return (
    <>
      <Modal show={modalOpenFlg} onShow={onShow} onHide={handleClose} centered>
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-info"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex w-100 align-items-center">
            <BsBookmarkCheck />
            <span className="ms-2">パターン呼出</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center">
              <Spinner animation="border" role="status" />
            </div>
          ) : !data?.length ? (
            <div className="w-100 mt-3 text-center align-items-center fs-5">
              登録されたパターンはありません。
            </div>
          ) : (
            <>
              <div className="w-100 mb-2">※削除は2秒以上長押し</div>
              <Table style={{ tableLayout: "fixed", width: "100%" }}>
                <colgroup>
                  <col style={{ width: 95 }} />
                  <col style={{ maxWidth: 145 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead>
                  <tr
                    className=""
                    {...(width <= 576 && { style: { fontSize: "0.8rem" } })}
                  >
                    <th>タイトル</th>
                    <th>概要</th>
                    <th className="text-danger text-center">{compMsg}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((data, index) => (
                    <tr
                      key={data.tno}
                      className="align-middle"
                      {...(width <= 576 && { style: { fontSize: "0.8rem" } })}
                    >
                      <td>{data.title}</td>
                      <td>{setOverview(index)}</td>
                      <td className="text-end px-0">
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleApply(data)}
                        >
                          適用
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onMouseDown={handlePressStart} // PC用
                          onMouseUp={() => handlePressEnd(data)} // PC用
                          onTouchStart={handlePressStart} // モバイル用
                          onTouchEnd={() => handlePressEnd(data)} // モバイル用
                        >
                          削除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-start border-top-0">
          <Button variant="secondary" onClick={handleClose} size="lg">
            戻る
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
