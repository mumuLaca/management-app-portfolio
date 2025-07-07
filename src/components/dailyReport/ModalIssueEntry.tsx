import { CodeCRUD, IssueStatus } from "@/lib/constants";
import { TypeAPIResponse } from "@/pages/api/approval/get/status/[...params]";
import { getCodeCRUDKey, getIssueStatusKey } from "@/utils/constantsUtil";
import { Issue } from "@prisma/client";
import axios from "axios";
import dayjs from "dayjs";
import "flatpickr/dist/flatpickr.min.css";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import FlatPickr from "react-flatpickr";
import { FaList } from "react-icons/fa";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { KeyedMutator } from "swr";
import { CombinedDailyReportPostProps, Section } from "./TweetArea";
import { set } from "lodash";

type Props = {
  targetIssue: Issue | undefined;
  categories: string[];
  issueCRUDFlg: string;
  issueModalOpenFlg: boolean;
  setIssueModalOpenFlg: React.Dispatch<React.SetStateAction<boolean>>;
  setIssuesChangeFlg: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * @description
 * 課題登録モーダル
 */
export default function ModalIssueEntry({
  targetIssue,
  categories,
  issueCRUDFlg,
  issueModalOpenFlg,
  setIssueModalOpenFlg,
  setIssuesChangeFlg,
}: Props) {
  const [entryDate, setEntryDate] = useState<Date>(dayjs().toDate()); // 発生日付
  const [category, setCategory] = useState<string>(""); // カテゴリー
  const [status, setStatus] = useState<string>(""); // 状況
  const [content, setContent] = useState<string>(""); // 内容
  const [startDate, setStartDate] = useState<Date | undefined>(undefined); // 実施日
  const [completeDate, setCompleteDate] = useState<Date | undefined>(undefined); // 完了日
  const [msg, setMsg] = useState<JSX.Element>(<></>);

  // 月初日
  const firstDayOfMonth = dayjs(dayjs().toDate()).startOf("month").toDate();
  // 月末日
  const lastDayOfMonth = dayjs(dayjs().toDate()).endOf("month").toDate();

  useEffect(() => {
    if (issueModalOpenFlg) {
      setEntryDate(targetIssue?.date ?? dayjs().toDate());
      setCategory(targetIssue?.category ?? "");
      setStatus(targetIssue?.status ?? "");
      setContent(targetIssue?.content ?? "");
      setStartDate(targetIssue?.startDate ?? undefined);
      setCompleteDate(targetIssue?.completeDate ?? undefined);
    }
  }, [issueModalOpenFlg, targetIssue]);

  /** 課題登録処理 */
  const handleIssuseEntry = async () => {
    await axios
      .post("/api/dailyReport/update/issue", {
        roomId: targetIssue?.roomId,
        issueNo: targetIssue?.issueNo,
        date: entryDate,
        category: category,
        content: content,
        status: status,
        startDate: startDate,
        completeDate: completeDate,
      })
      .then((res) => {
        if (res.status === 200) {
          setMsg(<Alert variant="success">課題の更新が完了しました。</Alert>);
          setIssuesChangeFlg(true); // 課題一覧を更新するためのフラグを立てる
        }
      })
      .catch((err) => {
        console.error(err);
        setMsg(<Alert variant="danger">課題の更新に失敗しました。</Alert>);
      })
      .finally(() => {
        setTimeout(() => {
          handleCLose();
        }, 1000);
      });
  };

  /** 課題削除処理 */
  const handleIssueDelete = async () => {
    await axios
      .post("/api/dailyReport/delete/issue", {
        roomId: targetIssue?.roomId,
        issueNo: targetIssue?.issueNo,
      })
      .then((res) => {
        if (res.status === 200) {
          setMsg(<Alert variant="success">課題の削除が完了しました。</Alert>);
          setIssuesChangeFlg(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setMsg(<Alert variant="danger">課題の削除に失敗しました。</Alert>);
      })
      .finally(() => {
        setTimeout(() => {
          handleCLose();
        }, 1000);
      });
  };

  const handleCLose = () => {
    setEntryDate(dayjs().toDate());
    setCategory("");
    setStatus("");
    setContent("");
    setStartDate(undefined);
    setCompleteDate(undefined);
    setMsg(<></>);
    setIssueModalOpenFlg(false);
  };

  return (
    <>
      <Modal show={issueModalOpenFlg} onHide={handleCLose} centered size="lg">
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-dark"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex align-items-center">
            <MdOutlinePlaylistAdd />
            <span className="ms-2">課題登録</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {msg}
          <Row>
            <Form.Group as={Col} className="mb-3">
              <Form.Label>発生日付</Form.Label>
              <FlatPickr
                value={entryDate}
                className="form-control"
                onChange={(date) => setEntryDate(date[0])}
                options={{
                  minDate: firstDayOfMonth,
                  maxDate: lastDayOfMonth,
                  locale: Japanese,
                  dateFormat: "Y/m/d",
                }}
              />
            </Form.Group>
            <Form.Group
              as={Col}
              className="mb-3 d-flex align-items-start justify-content-end"
            ></Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} className="mb-1">
              <Form.Label>カテゴリー</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="カテゴリを入力or選択"
                />

                <DropdownButton
                  variant="outline-secondary"
                  title=""
                  align="end"
                  disabled={(categories?.length ?? 0) === 0}
                >
                  {categories?.map((category) => (
                    <Dropdown.Item
                      key={category}
                      onClick={() => setCategory(category)}
                    >
                      {category}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </InputGroup>
            </Form.Group>
            <Form.Group as={Col} className="mb-1">
              <Form.Label>状況</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {Object.values(IssueStatus).map((status, index) => (
                  <option key={index} value={status.code}>
                    {status.caption}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} className="mb-3">
              <Form.Label>内容</Form.Label>
              <Form.Control
                type="textArea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} className="mb-1">
              <Form.Label>実施日</Form.Label>
              <FlatPickr
                value={startDate}
                className="form-control"
                onChange={(date) => setStartDate(date[0])}
                options={{
                  minDate: firstDayOfMonth,
                  locale: Japanese,
                  dateFormat: "Y/m/d",
                }}
              />
            </Form.Group>
            <Form.Group as={Col} className="mb-1">
              {issueCRUDFlg === CodeCRUD.update.code && (
                <>
                  <Form.Label>完了日</Form.Label>
                  <FlatPickr
                    value={completeDate}
                    className="form-control"
                    onChange={(date) => setCompleteDate(date[0])}
                    options={{
                      minDate: firstDayOfMonth,
                      locale: Japanese,
                      dateFormat: "Y/m/d",
                    }}
                  />
                </>
              )}
            </Form.Group>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            {issueCRUDFlg === CodeCRUD.update.code && (
              <Button
                variant="danger"
                className="px-5"
                onClick={handleIssueDelete}
              >
                削除
              </Button>
            )}
          </div>
          <div>
            <Button
              variant="primary"
              className="px-5"
              onClick={handleIssuseEntry}
            >
              {CodeCRUD[getCodeCRUDKey(issueCRUDFlg)].caption}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
