"use client";

import axios from "axios";
import dayjs from "@/lib/dayjs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { AdminRights, ReportPattern } from "@/lib/constants";
import { Session } from "next-auth";
import ModalCSVDownload from "./ModalCSVDownload";

interface Props {
  session: Session;
  yearMonth: string;
  setyearMonth: Dispatch<SetStateAction<string>>;
  filterReport: string;
  setFilterReport: Dispatch<SetStateAction<string>>;
  filterSection: string;
  setFilterSection: Dispatch<SetStateAction<string>>;
}

/**
 * @description
 * 提出状況一覧‗ヘッダー
 *
 */
export default function Header({
  session,
  yearMonth,
  setyearMonth,
  filterReport,
  setFilterReport,
  filterSection,
  setFilterSection,
}: Props) {
  const [actionAPI, setActionAPI] = useState<string>("");
  const [approvalStatus, setApprovalStatus] = useState<string>("");
  const [sectionList, setSectionList] = useState<string[]>();
  const [modalCSVOpenFlg, setModalCSVOpenFlg] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);

  /** useEffect_所属一覧設定 */
  useEffect(() => {
    // 所属の一覧を取得
    const getSection = async () => {
      try {
        if (session.employee.admin === AdminRights.leader.code) {
          // 「拠点管理者」の場合は所属先メンバーの閲覧を可能にする
          setSectionList([session.employee.section]);
        } else {
          // 全拠点の一覧を取得
          const result = await axios.get("/api/employee/get/section");
          const resultData = await result.data.map(
            (data: { section: string }) => data.section
          );
          setSectionList(resultData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    getSection();
  }, [session]);

  /** useEffect_実行するCSVダウンロードAPI */
  useEffect(() => {
    switch (filterReport) {
      case ReportPattern.attendance.code:
        setActionAPI("/api/csv/attendance");
        break;
      case ReportPattern.settlement.code:
        setActionAPI("/api/csv/settlement");
        break;
      case ReportPattern.reimbursement.code:
        setActionAPI("/api/csv/reimbursement");
        break;
    }
  }, [filterReport]);

  /** 表示月プルダウンリスト作成（1年分） */
  const monthsList = Array.from({ length: 13 }, (_, i) =>
    dayjs().add(-i, "month")
  ).map((subMonth) => ({
    caption: subMonth.format("YYYY年MM月"),
    value: subMonth.format("YYYYMM"),
  }));

  /** CSVダウンロード */
  const downloadCSV = useCallback(() => {
    // CSVモーダルを閉じる
    setModalCSVOpenFlg(false);
    // formのactionAPIを起動
    if (formRef.current) {
      formRef.current.submit();
    }
  }, [formRef, setModalCSVOpenFlg]);

  return (
    <>
      <Container fluid>
        <Form action={actionAPI} method="GET" ref={formRef}>
          <Row>
            <Col
              xs={12}
              sm={12}
              lg={3}
              xl={3}
              className="d-flex text-nowrap mb-3"
            >
              <Form.Select
                className="me-2 w-auto"
                name="ym"
                value={yearMonth}
                onChange={(e) => setyearMonth(e.target.value)}
              >
                {monthsList.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.caption}
                  </option>
                ))}
              </Form.Select>
              <Button
                variant="success"
                onClick={() => setModalCSVOpenFlg(true)}
              >
                ダウンロード
              </Button>
            </Col>
            <Col xs={0} sm={0} lg={3} xl={3}></Col>
            <Col
              xs={6}
              sm={6}
              lg={3}
              xl={3}
              className="mb-3 d-flex align-items-center text-end"
            >
              <h6 className="text-nowrap mb-0 me-2">対象</h6>
              <Form.Select
                name="filterItem"
                className="form-select"
                value={filterReport}
                onChange={(e) => setFilterReport(e.target.value)}
              >
                <>
                  {Object.values(ReportPattern).map((obj, index) => (
                    <option key={index} value={obj.code}>
                      {obj.name}
                    </option>
                  ))}
                </>
              </Form.Select>
            </Col>
            <Col
              xs={6}
              sm={6}
              lg={3}
              xl={3}
              className="mb-3 d-flex align-items-center text-end"
            >
              <h6 className="text-nowrap mb-0 me-2">所属</h6>
              <Form.Select
                name="filterSection"
                className="form-select"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                disabled={session?.employee.admin === AdminRights.leader.code}
              >
                <option value={""}>指定なし</option>
                {sectionList?.map((obj, index) => (
                  <option key={index} value={obj}>
                    {obj}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <input type="hidden" name="approvalStatus" value={approvalStatus} />
        </Form>
      </Container>
      <ModalCSVDownload
        modalCSVOpenFlg={modalCSVOpenFlg}
        setModalCSVOpenFlg={setModalCSVOpenFlg}
        modalCloseFunction={downloadCSV}
        approvalStatus={approvalStatus}
        setApprovalStatus={setApprovalStatus}
        yearMonth={yearMonth}
        filterReport={filterReport}
        filterSection={filterSection}
      />
    </>
  );
}
