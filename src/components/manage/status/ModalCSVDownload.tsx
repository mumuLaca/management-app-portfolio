import React, { Dispatch, SetStateAction } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  ApprovalStatusAttendance,
  ApprovalStatusReimbursement,
  ApprovalStatusSettlement,
  ReportPattern,
} from "@/lib/constants";
import dayjs from "@/lib/dayjs";
import { getReportPatternKey } from "@/utils/constantsUtil";

type Props = {
  modalCSVOpenFlg: boolean;
  setModalCSVOpenFlg: Dispatch<SetStateAction<boolean>>;
  modalCloseFunction: VoidFunction;
  approvalStatus: string;
  setApprovalStatus: Dispatch<SetStateAction<string>>;
  yearMonth: string;
  filterReport: string;
  filterSection: string;
};

/**
 * @description
 * CSVダウンロード確認モーダル
 */
export default function ModalCSVDownload({
  modalCSVOpenFlg,
  setModalCSVOpenFlg,
  modalCloseFunction,
  approvalStatus,
  setApprovalStatus,
  yearMonth,
  filterReport,
  filterSection,
}: Props) {
  /** モーダルオープン時処理 */
  const onShow = () => {
    setApprovalStatus("5");
  };

  return (
    <div>
      <Modal
        show={modalCSVOpenFlg}
        onShow={onShow}
        onHide={() => setModalCSVOpenFlg(false)}
        centered
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-success"
          style={{ color: "#fff" }}
        >
          <Modal.Title>
            <span>CSVダウンロード</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="fw-bold fs-5 mb-4">
              以下の条件でCSVを出力します。
            </div>
            <div className="px-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-primary">対象年月</span>
                <span className="fw-bold fs-5">
                  {dayjs(`${yearMonth}01`, "YYYYMMDD").format("YYYY年MM月")}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-primary">所属</span>
                <span className="fw-bold fs-5">
                  {filterSection ? filterSection : "全て"}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-primary">レポート種別</span>
                <span className="fw-bold fs-5">
                  {ReportPattern[getReportPatternKey(filterReport)].name}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-primary">承認ステータス</span>
                <Form.Select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value)}
                  className="w-50"
                >
                  <option value={""}>全て</option>
                  {Object.values(
                    filterReport === ReportPattern.attendance.code
                      ? ApprovalStatusAttendance
                      : filterReport === ReportPattern.settlement.code
                      ? ApprovalStatusSettlement
                      : ApprovalStatusReimbursement
                  ).map((obj) => (
                    <option key={obj.code} value={obj.code}>
                      {obj.caption}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setModalCSVOpenFlg(false)}
          >
            キャンセル
          </Button>
          <Button variant="success" size="lg" onClick={modalCloseFunction}>
            ダウンロード
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
