import {
  ApprovalStatusAttendance,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
  ReportPattern,
} from "@/lib/constants";
import { TypeAPIResponse } from "@/app/api/approval/status/[yearMonth]/[filterSection]/route";
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { BsEnvelopeFill } from "react-icons/bs";
import { KeyedMutator } from "swr";

interface Props {
  modalRevertOpenFlg: boolean;
  setModalRevertOpenFlg: Dispatch<SetStateAction<boolean>>;
  revertData: TypeAPIResponse & { reportPattern: string };
  mutate: KeyedMutator<TypeAPIResponse[]>;
  yearAndMonth: string;
}

/**
 * @description
 * 差戻モーダル
 */
export default function ModalRevert({
  modalRevertOpenFlg,
  setModalRevertOpenFlg,
  revertData,
  mutate,
  yearAndMonth,
}: Props) {
  const [message, setMessage] = useState<string>("");

  /** useEffect */
  useEffect(() => {
    if (revertData) {
      switch (revertData.reportPattern) {
        // 勤務表
        case ReportPattern.attendance.code:
          setMessage(
            `【${yearAndMonth.slice(0, 4)}年${yearAndMonth.slice(
              4
            )}月 勤務表差戻し】\n勤務表に不備がありますので、修正をお願いします。修正後に再提出してください。\n\n不備内容:\n`
          );
          break;

        // 交通費精算表
        case ReportPattern.settlement.code:
          setMessage(
            `【${yearAndMonth.slice(0, 4)}年${yearAndMonth.slice(
              4
            )}月 交通費精算表差戻し】\n交通費精算表に不備がありますので、修正をお願いします。修正後に再提出してください。\n\n不備内容:\n`
          );
          break;

        // 立替精算表
        case ReportPattern.reimbursement.code:
          setMessage(
            `【${yearAndMonth.slice(0, 4)}年${yearAndMonth.slice(
              4
            )}月 立替精算表差戻し】\n立替精算表に不備がありますので、修正をお願いします。修正後に再提出してください。\n\n不備内容:\n`
          );
          break;
      }
    }
  }, [revertData, yearAndMonth]);

  /** 差戻に必要なデータがなければreturn */
  if (!revertData) {
    return <></>;
  }

  /** モーダルを閉じる */
  const onHide = () => {
    setMessage("");
    setModalRevertOpenFlg(false);
  };

  /** メッセージ送信、及び差戻し処理 */
  const handleRevert = async () => {
    const sendMessage = await axios.post("/api/slack/sendSlackMessageToUser", {
      email: revertData?.email,
      message: message,
    });

    if (sendMessage.status === 200) {
      switch (revertData.reportPattern) {
        // 勤務表
        case ReportPattern.attendance.code:
          await axios.post("/api/approval/update/attendance", {
            id: revertData.id,
            yearMonth: yearAndMonth,
            approve: ApprovalStatusAttendance.reinput.code,
          });
          break;

        // 交通費精算表
        case ReportPattern.settlement.code:
          await axios.post("/api/approval/update/settlement", {
            id: revertData.id,
            yearMonth: yearAndMonth,
            approve: ApprovalStatusSettlement.reinput.code,
          });
          break;

        // 立替精算表
        case ReportPattern.reimbursement.code:
          await axios.post("/api/approval/update/reimbursement", {
            id: revertData.id,
            yearMonth: yearAndMonth,
            approve: ApprovalStatusReimbursement.reinput.code,
          });
          break;
      }

      alert("メッセージの送信に成功しました。");
      setModalRevertOpenFlg(false);

      // 表示の更新
      mutate();
    } else {
      alert("メッセージの送信に失敗しました。");
      setModalRevertOpenFlg(false);
      mutate();
    }
  };

  return (
    <div>
      <Modal show={modalRevertOpenFlg} onHide={onHide} centered size="lg">
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-dark"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex align-items-center">
            <BsEnvelopeFill />
            <span className="ps-2">差戻し処理</span>
          </Modal.Title>
        </Modal.Header>
        <Alert className="mx-4 mt-3" variant="info">
          ※メッセージの送信はBotにより行われます。
        </Alert>
        <Modal.Body>
          <div className="d-grid align-middle">
            <dl style={{ fontSize: "20px" }}>
              <dt>宛先</dt>
              <dd className="ms-4">{`${revertData.name}　<${revertData.email}>`}</dd>
            </dl>
          </div>
          <Form>
            <Form.Group className="mb-3" style={{ fontSize: "20px" }}>
              <Form.Label className="fw-bold">メッセージ</Form.Label>
              <Form.Control
                as="textarea"
                value={message}
                rows={8}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" size="lg" onClick={onHide}>
            キャンセル
          </Button>
          <Button
            variant="dark"
            className="fw-bold"
            size="lg"
            onClick={handleRevert}
          >
            送信
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
