import React, { useState, Dispatch, useRef, useEffect } from "react";
import styles from "@/styles/DailyReport.module.css";
import { Button } from "react-bootstrap";
import { AiOutlineComment } from "react-icons/ai";
import { CombinedDailyReportPostProps, Section } from "./TweetArea";
import {
  ApprovalStatusDailyReport,
  CodeCRUD,
  DailyReportAuthority,
  DailyReportType,
  IssueStatus,
} from "@/lib/constants";
import { TbMessageReply } from "react-icons/tb";
import { Session } from "next-auth";
import axios from "axios";
import { KeyedMutator } from "swr";
import Comment from "./Comment";
import Reply from "./Reply";
import { LuClipboardCopy } from "react-icons/lu";
import { LuClipboardPaste } from "react-icons/lu";
import { Issue } from "@prisma/client";
import dayjs from "dayjs";
import type { DailyReportCommonUrlParams } from "@/types/types";

type Props = {
  index: number;
  session: Session;
  urlParams: DailyReportCommonUrlParams;
  date: Date;
  authority: string;
  approvalStatus: string;
  section: Section;
  issues?: Issue[];
  sections: Section[];
  setSections: Dispatch<React.SetStateAction<Section[]>>;
  setIssueModalOpenFlg: Dispatch<React.SetStateAction<boolean>>;
  setTargetIssue: Dispatch<React.SetStateAction<Issue | undefined>>;
  setIssueCRUDFlg: Dispatch<React.SetStateAction<string>>;
  mutate: KeyedMutator<CombinedDailyReportPostProps>;
};

export default function Tweet({
  index,
  session,
  urlParams,
  date,
  authority,
  approvalStatus,
  section,
  issues,
  sections,
  setSections,
  setIssueModalOpenFlg,
  setTargetIssue,
  setIssueCRUDFlg,
  mutate,
}: Props) {
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [replyAreaOpenFlg, setReplyAreaOpenFlg] = useState<boolean>(false);
  const [commentAreaOpenFlg, setCommentAreaOpenFlg] = useState<boolean>(false);
  const [copyMsg, setCopyMsg] = useState<string>("copy");
  const [pasteMsg, setPasteMsg] = useState<string>("paste");

  const tweetContentRef = useRef<HTMLTextAreaElement>(null);

  const SECTION_LENGTH_DEFAULT = 5; // セクションの長さ
  const SECTION_LENGTH_QUARTER = 4; // セクションの長さ

  const { roomId, dailyReportType } = urlParams as DailyReportCommonUrlParams;

  useEffect(() => {
    handletweetContentInput();
  }, [section.content]); // セクションの内容が変更されたときに高さを調整

  /** セクションの内容変更を保存 */
  const handleSectionChange = (
    index: number,
    field: "title" | "content",
    value: string
  ) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  /** 削除ボタンクリック開始 */
  const handlePressStart = () => {
    const startTime = Date.now();
    setPressStartTime(startTime); // 長押し開始時間を記録
  };

  /** 削除ボタンクリック終了 */
  const handlePressEnd = async (index: number) => {
    if (pressStartTime !== null) {
      const duration = Date.now() - pressStartTime;

      // 長押しで削除処理実行
      if (duration >= 500) {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
      }
    }
    // 開始時刻を初期化
    setPressStartTime(null);
  };

  /** テキストエリアの変更可否判定 */
  const approcalStatusDisabled = () => {
    if (
      authority === DailyReportAuthority.trainer.code ||
      authority === DailyReportAuthority.officeStaff.code
    ) {
      return true; // 管理者は常に変更可能
    }

    // ステータスに応じて変更制御
    switch (approvalStatus) {
      case ApprovalStatusDailyReport.noInput.code:
      case ApprovalStatusDailyReport.saveTemporary.code:
      case ApprovalStatusDailyReport.firstPending.code:
      case ApprovalStatusDailyReport.secondPending.code:
        return false;
      case ApprovalStatusDailyReport.submitted.code:
      case ApprovalStatusDailyReport.firstApproval.code:
      case ApprovalStatusDailyReport.secondApproval.code:
        return true;
    }
  };

  /** コメント投稿処理 */
  const handleCommentSubmit = async (
    comment: string,
    crud: string,
    commentNo: number | undefined = undefined
  ) => {
    await axios
      .post("/api/dailyReport/update/sectionComment", {
        postId: section.postId ?? "",
        indexNo: section.indexNo,
        employeeId: session.employee.id,
        employeeName: session.employee.name,
        commentNo: commentNo,
        content: comment,
        date: date,
        crud: crud,
      })
      .then((res) => {
        mutate().then(() => {
          setCommentAreaOpenFlg(false); // コメントエリアを閉じる
          setReplyAreaOpenFlg(true); // リプライエリアを開く
          console.info("コメント投稿成功", res.data);
        });
      });
  };

  const handleCopy = (content: string) => {
    return () => {
      navigator.clipboard.writeText(content).then(() => {
        setCopyMsg("OK!");
        setTimeout(() => {
          setCopyMsg("copy");
        }, 1000); // 1秒後にメッセージを元に戻す
      });
    };
  };

  /** セクションの内容変更を保存 */
  const handlePaste = async (index: number) => {
    await navigator.clipboard
      .readText()
      .then((text) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], content: text };
        setSections(newSections);
        setPasteMsg("OK!");
        setTimeout(() => {
          setPasteMsg("paste");
        }, 1000); // 1秒後にメッセージを元に戻す
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
        alert("クリップボードの読み取りに失敗しました。");
      });
  };

  const handletweetContentInput = () => {
    const textarea = tweetContentRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // 高さをリセット
      textarea.style.height = `${textarea.scrollHeight}px`; // コンテンツに合わせて高さを調整
    }
  };

  return (
    <div key={index} className={styles.tweetCard}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <input
          type="text"
          value={section.title}
          maxLength={50}
          onChange={(e) => handleSectionChange(index, "title", e.target.value)}
          placeholder="セクションタイトル"
          className={styles.sectionTitle}
          disabled={
            dailyReportType === DailyReportType.quarter.code
              ? index < SECTION_LENGTH_QUARTER
              : index < SECTION_LENGTH_DEFAULT
          }
        />
        <div className={styles.tweetButtonGroup}>
          {authority === DailyReportAuthority.mySelf.code && (
            <>
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2 px-1"
                onClick={handleCopy(section.content)}
              >
                <LuClipboardCopy />
                <span>{copyMsg}</span>
              </Button>
              {(approvalStatus === ApprovalStatusDailyReport.noInput.code ||
                approvalStatus ===
                  ApprovalStatusDailyReport.saveTemporary.code) && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2 px-1"
                  onClick={() => handlePaste(index)}
                >
                  <LuClipboardPaste />
                  <span>{pasteMsg}</span>
                </Button>
              )}
            </>
          )}
          {index === 2 &&
            authority === DailyReportAuthority.mySelf.code &&
            (approvalStatus === ApprovalStatusDailyReport.noInput.code ||
              approvalStatus ===
                ApprovalStatusDailyReport.saveTemporary.code) && (
              <>
                <Button
                  size="sm"
                  variant="dark"
                  onClick={() => {
                    setTargetIssue({
                      roomId: roomId,
                      issueNo: (issues?.length ?? 0) + 1,
                      date: dayjs().toDate(),
                      category: "",
                      content: section.content,
                      detail: "",
                      status: IssueStatus.inComplete.code,
                      startDate: null,
                      completeDate: null,
                      createdAt: dayjs().toDate(),
                      updatedAt: dayjs().toDate(),
                    });
                    setIssueCRUDFlg(CodeCRUD.create.code);
                    setIssueModalOpenFlg(true);
                  }}
                >
                  課題化
                </Button>
              </>
            )}
          {(dailyReportType === DailyReportType.quarter.code
            ? index >= SECTION_LENGTH_QUARTER
            : index >= SECTION_LENGTH_DEFAULT) &&
            (approvalStatus === ApprovalStatusDailyReport.noInput.code ||
              approvalStatus ===
                ApprovalStatusDailyReport.saveTemporary.code) && (
              <Button
                variant="danger"
                size="sm"
                onMouseDown={handlePressStart} // PC用
                onMouseUp={() => handlePressEnd(index)} // PC用
                onTouchStart={handlePressStart} // モバイル用
                onTouchEnd={() => handlePressEnd(index)} // モバイル用
              >
                削除
              </Button>
            )}
        </div>
      </div>
      <div>
        <textarea
          ref={tweetContentRef}
          onInput={handletweetContentInput}
          value={section.content}
          onChange={(e) =>
            handleSectionChange(index, "content", e.target.value)
          }
          placeholder={
            approcalStatusDisabled() ? `未入力` : `内容を入力してください`
          }
          className={styles.tweetContent}
          readOnly={approcalStatusDisabled()}
        />
      </div>
      {approvalStatus !== ApprovalStatusDailyReport.noInput.code &&
        approvalStatus !== ApprovalStatusDailyReport.saveTemporary.code && (
          <>
            <div className="d-flex justify-content-end align-items-center gap-2">
              <button
                className={`${styles.tweetStampButton} ${styles.tweetStampButtonReply}`}
                disabled={
                  (section.sectionComment ?? []).length > 0 ? false : true
                }
                onClick={() => setReplyAreaOpenFlg(!replyAreaOpenFlg)}
              >
                <AiOutlineComment className={styles.tweetStamp} />
                <span>{section.sectionComment?.length ?? 0}</span>
              </button>
              <button
                className={`${styles.tweetStampButton}`}
                onClick={() => setCommentAreaOpenFlg(!commentAreaOpenFlg)}
              >
                <TbMessageReply className={styles.tweetStamp} />
                <span className="fs-6">コメントする</span>
              </button>
            </div>
            <Comment
              commentAreaOpenFlg={commentAreaOpenFlg}
              handleCommentSubmit={handleCommentSubmit}
            />
            <Reply
              session={session}
              replyAreaOpenFlg={replyAreaOpenFlg}
              section={section}
              handleCommentSubmit={handleCommentSubmit}
            />
          </>
        )}
    </div>
  );
}
