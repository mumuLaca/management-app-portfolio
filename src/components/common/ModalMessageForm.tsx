import { Employee, RoomMember } from "@prisma/client";
import axios from "axios";
import "flatpickr/dist/flatpickr.min.css";
import { JSX, useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { IoIosMail } from "react-icons/io";
import styles from "@/styles/MessageForm.module.css";
import { FaTimesCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";

type Props = {
  address?: number[]; // 宛先
  messageModalOpenFlg: boolean;
  mFormCloseFunction: () => void;
};

/**
 * @description
 * Slackメッセージモーダル
 */
export default function ModalMessageForm({
  address,
  messageModalOpenFlg,
  mFormCloseFunction,
}: Props) {
  const [title, setTitle] = useState<string>(""); // タイトル
  const [content, setContent] = useState<string>(""); // 内容
  const [msg, setMsg] = useState<JSX.Element>(<></>);

  const employeeInfoRef = useRef<Employee[]>([]); // 最新の employeeInfo を保持

  // 宛先
  const [addressText, setAddressText] = useState<string>(""); // 入力テキスト
  const [showAddressListFlg, setShowAddressListFlg] = useState<boolean>(false); // 候補リスト表示フラグ
  const [candidateAddressList, setCandidateAddressList] = useState<Employee[]>(
    []
  ); // 候補リスト
  const [selectAddressList, setSelectAddressList] = useState<Employee[]>([]); // 選択リスト
  const addressRef = useRef<HTMLDivElement>(null);

  const messageFormRef = useRef<HTMLTextAreaElement>(null); // メッセージフォームのref

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();

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

  useEffect(() => {
    if (messageModalOpenFlg && employeeInfoRef?.current && address) {
      setSelectAddressList(
        employeeInfoRef.current.filter(
          (user) => address?.includes(user.id) // 既に選択されているメンバーを表示
        )
      );
    }
  }, [messageModalOpenFlg, address]);

  // データ取得中はローディング
  if (sessionStatus === "loading") {
    return <></>;
  }

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

  /** Slackメッセージ送信処理 */
  const handlePostMessage = async () => {
    await axios
      .post("/api/slack/sendSlackMessageToMultiuser", {
        title: title,
        content: content,
        addressList: selectAddressList.map((employee) => employee.email),
        senderName: session?.employee.name,
      })
      .then((res) => {
        if (res.status === 200) {
          setMsg(
            <Alert variant="success">メッセージの送信が完了しました。</Alert>
          );
        }
      })
      .catch((err) => {
        console.error(err);
        setMsg(<Alert variant="danger">課題の更新に失敗しました。</Alert>);
      })
      .finally(() => {
        setTimeout(() => {
          setMsg(<></>); // メッセージを取り消す
          handleCLose();
        }, 1000);
      });
  };

  /** モーダルクローズ処理 */
  const handleCLose = () => {
    setTitle("");
    setContent("");
    setSelectAddressList([]); // 選択リスト
    mFormCloseFunction(); // モーダルを閉じる
    setMsg(<></>);
  };

  const hangleMesageFormInput = () => {
    const textarea = messageFormRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // 高さをリセット
      textarea.style.height = `${textarea.scrollHeight}px`; // コンテンツの高さに合わせて調整
    }
  };

  return (
    <>
      <Modal show={messageModalOpenFlg} onHide={handleCLose} centered size="xl">
        <Modal.Header
          closeButton
          closeVariant="white"
          className={styles.modalHeader}
          style={{ color: "#fff" }}
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <IoIosMail />
            <span>Slackメッセージ送信Form</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Form.Group as={Col} className="mb-4">
              <Form.Label className="fs-5">タイトル</Form.Label>
              <div>
                <input
                  className={styles.commonFormInput}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </Form.Group>
          </Row>
          <Row className="mb-4">
            <Form.Group as={Col}>
              <Form.Label className="fs-5">宛先</Form.Label>
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
          <Row>
            <Form.Group as={Col}>
              <Form.Label className="fs-5">内容</Form.Label>
              <div>
                <textarea
                  ref={messageFormRef}
                  onInput={hangleMesageFormInput}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.commonFormTextarea}
                />
              </div>
            </Form.Group>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end">
          <Button
            variant="success"
            size="lg"
            onClick={handlePostMessage}
            disabled={
              title === "" || content === "" || selectAddressList.length === 0
            }
          >
            送信
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
