import { Employee, RoomMember } from "@prisma/client";
import "flatpickr/dist/flatpickr.min.css";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { DailyReportCommonUrlParams } from "@/pages/dailyReport/[...slug]";
import Calendar from "./Calendar";
import JoinUser from "./JoinUser";
import { LuCalendarRange } from "react-icons/lu";
import {
  Alert,
  Button,
  Col,
  Form,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import FlatPickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import dayjs from "dayjs";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import { Session } from "next-auth";
import axios from "axios";
import styles from "@/styles/DailyReport.module.css";
import { FaTimesCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { ApprovalStatusDailyReport } from "@/lib/constants";
import { BsQuestionCircle } from "react-icons/bs";

type Props = {
  changeApprovalStatus: string; // 承認ステータス
  urlParams: DailyReportCommonUrlParams;
  modalSAOpenFlg: boolean;
  setModalSAOpenFlg: Dispatch<React.SetStateAction<boolean>>;
  handleBulkUpdateComplete: () => Promise<void>;
};

/**
 * @description
 * 範囲承認モーダル
 */
export default function ModalScopeApproval({
  changeApprovalStatus,
  urlParams,
  modalSAOpenFlg,
  setModalSAOpenFlg,
  handleBulkUpdateComplete,
}: Props) {
  const [startDate, setStartDate] = useState<Date>(dayjs().toDate()); // 開始日
  const [endDate, setEndDate] = useState<Date>(dayjs().toDate()); // 終了日
  const [messageFormOpenFlg, setMessageFormOpenFlg] = useState<boolean>(false); // メッセージモーダルのオープンフラグ
  const [msg, setMsg] = useState<JSX.Element>(<></>); // メッセージ
  const [selectAddressList, setSelectAddressList] = useState<Employee[]>([]); // 選択リスト
  const [content, setContent] = useState<string>(""); // 内容

  const { roomId, fromDate, toDate } = urlParams as DailyReportCommonUrlParams; // URLパラメータ

  // カレンダーの選択日(From)
  const periodFrom = dayjs(fromDate).toDate();
  // カレンダーの選択日(To)
  const periodTo = dayjs(toDate).toDate();

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (modalSAOpenFlg) {
      let titleSatatus = "";
      switch (changeApprovalStatus) {
        case ApprovalStatusDailyReport.submitted.code:
          titleSatatus = "【提出報告】";
          break;
        case ApprovalStatusDailyReport.firstApproval.code:
          titleSatatus = "【育成担当承認報告】";
          break;
        case ApprovalStatusDailyReport.secondApproval.code:
          titleSatatus = "【本社承認報告】";
          break;
      }

      setContent(
        `${titleSatatus}\nfrom: ${session?.employee.name}\n対象期間: ${dayjs(
          startDate
        ).format("MM/DD(dd)")}~${dayjs(endDate).format(
          "MM/DD(dd)"
        )}\n\nメッセージ:\n`
      );
    }
  }, [startDate, endDate, changeApprovalStatus, modalSAOpenFlg, session]);

  // データ取得中はローディング
  if (sessionStatus === "loading") {
    return <></>;
  }

  /** ボタン表示テキスト */
  const displayButtonText = () => {
    switch (changeApprovalStatus) {
      case ApprovalStatusDailyReport.submitted.code:
        return "一括提出";
      case ApprovalStatusDailyReport.firstApproval.code:
      case ApprovalStatusDailyReport.secondApproval.code:
        return "一括承認";
    }
    return "ー";
  };

  /** 一括更新 */
  const handleBulkUpdate = async () => {
    const response = await axios.post(
      "/api/dailyReport/update/bulkApprovalStatus",
      {
        roomId: roomId,
        startDate: dayjs(startDate).format("YYYY/MM/DD"),
        endDate: dayjs(endDate).format("YYYY/MM/DD"),
        approvalStatus: changeApprovalStatus,
        addressList: selectAddressList.map((user) => user.email),
        content: content,
        messageFormOpenFlg: messageFormOpenFlg,
      }
    );

    if (response.status === 200) {
      setMsg(<Alert variant="success">一括更新が完了しました。</Alert>);
      handleBulkUpdateComplete();
      setModalSAOpenFlg(false); // モーダルを閉じる
    } else {
      setMsg(<Alert variant="danger">一括更新に失敗しました。</Alert>);
    }

    setTimeout(() => {
      // 1.5秒後にモーダルを閉じる
      handleClose();
    }, 1500);
  };

  /** モーダルクローズ */
  const handleClose = () => {
    setStartDate(dayjs().toDate()); // 開始日を初期化
    setEndDate(dayjs().toDate()); // 終了日を初期化
    setMessageFormOpenFlg(false); // メッセージモーダルを閉じる
    setSelectAddressList([]); // 選択リストを初期化
    setContent(""); // 内容を初期化
    setMsg(<></>);
    setModalSAOpenFlg(false); // モーダルを閉じる
  };

  return (
    <>
      <Modal show={modalSAOpenFlg} onHide={handleClose} centered size="lg">
        <Modal.Header
          closeButton
          closeVariant="white"
          className="bg-success"
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <LuCalendarRange />
            <span>{displayButtonText()}</span>
            <CautionTooltip />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {msg}
          <Row className="mb-4">
            <Form.Group as={Col} sm={4} md={4}>
              <Form.Label>From</Form.Label>
              <FlatPickr
                value={startDate}
                onChange={(date) => setStartDate(date[0])}
                className="form-control"
                options={{
                  minDate: periodFrom,
                  maxDate: periodTo,
                  locale: Japanese,
                  dateFormat: "Y/m/d",
                }}
              />
            </Form.Group>
            <Form.Group as={Col} sm={1} md={1} className={styles.textFromTo}>
              <span>～</span>
            </Form.Group>
            <Form.Group as={Col} sm={4} md={4}>
              <Form.Label>To</Form.Label>
              <FlatPickr
                value={endDate}
                onChange={(date) => setEndDate(date[0])}
                className="form-control"
                options={{
                  minDate: periodFrom,
                  maxDate: periodTo,
                  locale: Japanese,
                  dateFormat: "Y/m/d",
                }}
              />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} className="mb-3">
              <Form.Check
                type="switch"
                label="Slackメッセージを送る"
                onChange={() => setMessageFormOpenFlg((prev) => !prev)}
                checked={messageFormOpenFlg}
              />
            </Form.Group>
          </Row>
          <MessageForm
            session={session!}
            messageFormOpenFlg={messageFormOpenFlg}
            selectAddressList={selectAddressList}
            setSelectAddressList={setSelectAddressList}
            content={content}
            setContent={setContent}
          />
        </Modal.Body>
        <Modal.Footer>
          <div>
            <Button
              variant="success"
              onClick={() => handleBulkUpdate()}
              disabled={
                !startDate ||
                !endDate ||
                startDate === endDate ||
                startDate > endDate
              }
            >
              {displayButtonText()}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/**
 * @description
 * Slackメッセージフォーム
 */
function MessageForm({
  session,
  messageFormOpenFlg,
  selectAddressList,
  setSelectAddressList,
  content,
  setContent,
}: {
  session: Session;
  messageFormOpenFlg: boolean;
  selectAddressList: Employee[];
  setSelectAddressList: Dispatch<React.SetStateAction<Employee[]>>;
  content: string;
  setContent: Dispatch<React.SetStateAction<string>>;
}) {
  const employeeInfoRef = useRef<Employee[]>([]); // 最新の employeeInfo を保持

  // 宛先
  const [addressText, setAddressText] = useState<string>(""); // 入力テキスト
  const [showAddressListFlg, setShowAddressListFlg] = useState<boolean>(false); // 候補リスト表示フラグ
  const [candidateAddressList, setCandidateAddressList] = useState<Employee[]>(
    []
  );

  const addressRef = useRef<HTMLDivElement>(null);
  const messageFormRef = useRef<HTMLTextAreaElement>(null); // メッセージフォームのref

  useEffect(() => {
    const getInputCandidate = async () => {
      // 入力候補取得
      await axios.get("/api/employee/get/all").then((res) => {
        const employeeInfo = res.data;
        setCandidateAddressList(employeeInfo);
        employeeInfoRef.current = employeeInfo; // クロージャによるデータ未更新を防ぐためのref
      });
    };

    getInputCandidate();

    /** 候補リスト */
    const handleClickOutside = (event: MouseEvent) => {
      // 育成担当者の候補リスト外をクリックした場合は、リストを非表示
      if (
        addressRef.current &&
        !addressRef.current.contains(event.target as Node)
      ) {
        setAddressText("");
        setShowAddressListFlg(false);
        setCandidateAddressList(employeeInfoRef.current);
      }
    };

    // イベント登録
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  /** 入力されたテキストから候補者をフィルタリング */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const match = value.match(/([\p{L}\p{N}_]*)$/u);
    // テキストの値を保存
    setAddressText(value);

    if (match) {
      const matchInput = (match.input as string)?.replace(/[\s\u3000]/g, "");

      // 入力情報より前方一致するメンバーをフィルタリング
      const filtered = employeeInfoRef.current.filter((user) =>
        matchInput
          ? user.name.replace(/[\s\u3000]/g, "").startsWith(matchInput)
          : true
      );

      // 候補リストを絞り込み
      setCandidateAddressList(filtered);
      // 候補リスト表示
      setShowAddressListFlg(true);
    }
  };

  /** 候補リスト選択時処理 */
  const handleSuggestionClick = (user: any) => {
    setSelectAddressList((prevList: any) => {
      if (
        user.id !== (session?.employee.id ?? 0) &&
        prevList.every((obj: any) => obj.id !== user.id)
      ) {
        return [...prevList, user];
      }
      return prevList;
    });
    setAddressText("");
    setShowAddressListFlg(false);
  };

  /** 候補リスト削除時処理 */
  const suggestionsDelete = (mention: any) => () => {
    setSelectAddressList((prevList: any) =>
      prevList.filter((obj: any) => obj.id !== mention.id)
    );
  };

  const handleMessageFormInput = () => {
    const textarea = messageFormRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // 高さをリセット
      textarea.style.height = `${textarea.scrollHeight}px`; // コンテンツの高さに合わせて調整
    }
  };

  return (
    <div
      className={`${styles.SAMessageForm} ${
        messageFormOpenFlg
          ? styles.SAMessageFormOpen
          : styles.SAMessageFormClose
      }`}
    >
      <Row className="mb-4 mx-0">
        <Form.Group as={Col}>
          <Form.Label>宛先</Form.Label>
          <div className={styles.mentionBox} ref={addressRef}>
            <input
              type="text"
              value={addressText}
              onFocus={() => setShowAddressListFlg(true)}
              onChange={(e) => handleChange(e)}
              onCompositionEnd={(e) => handleChange(e as any)}
              placeholder="宛先を入力し選択"
              className={styles.mentionInput}
            />
            {showAddressListFlg && (
              <ul className={styles.mentionList}>
                {candidateAddressList.map((employee: Employee) => (
                  <li
                    key={employee.id}
                    className={styles.mention}
                    onClick={() => handleSuggestionClick(employee)}
                  >
                    {employee.name}
                  </li>
                ))}
                {candidateAddressList.length === 0 && (
                  <li className="p-2 text-gray-400">No matches</li>
                )}
              </ul>
            )}
          </div>
          <div className="mt-2">
            {Array.from({
              length: Math.ceil(selectAddressList.length / 5),
            }).map((_, rowIndex) => {
              const start = rowIndex * 5;
              const end = start + 5;
              const group = selectAddressList.slice(start, end);

              return (
                <div key={rowIndex} className={styles.menttionRow}>
                  {group.map((mention: any, index: number) => (
                    <div key={index} className={styles.mentionMember}>
                      <span className="me-1">{mention.name}</span>
                      <FaTimesCircle
                        className={styles.mentionExclusion}
                        onClick={suggestionsDelete(mention)}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Form.Group>
      </Row>
      <Row className="mx-0">
        <Form.Group as={Col}>
          <Form.Label>内容</Form.Label>
          <div>
            <textarea
              ref={messageFormRef}
              onInput={handleMessageFormInput}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.messageFormTextarea}
            />
          </div>
        </Form.Group>
      </Row>
    </div>
  );
}

/**
 * @description
 * 注意文言表示用tooltip
 */
function CautionTooltip() {
  const renderTooltip = (
    <Tooltip id="tooltip" className="custom-tooltip">
      【説明】
      <br />
      <div className="d-flex align-items-start">
        <div>※</div>
        <div>
          未入力、提出済、承認済、差戻中の日報は自動的に対象外となります。
        </div>
      </div>
      <div className="d-flex align-items-start">
        <div>※</div>
        <div>
          表示中の報告書を含める場合、必ず一時保存をした上で実行してください。
        </div>
      </div>
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 0, hide: 200 }}
      overlay={renderTooltip}
    >
      <Button
        variant="white"
        className="border-0 p-0 text-light d-flex align-items-center fs-5"
      >
        <BsQuestionCircle />
      </Button>
    </OverlayTrigger>
  );
}
