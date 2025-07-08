import styles from "@/styles/DailyReport.module.css";
import { Section } from "./TweetArea";
import dayjs from "dayjs";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { createPortal } from "react-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { Button } from "react-bootstrap";
import { CodeCRUD } from "@/lib/constants";
import { GiCancel } from "react-icons/gi";
import { Session } from "next-auth";
import { SectionComment } from "@prisma/client";

type Props = {
  session: Session;
  replyAreaOpenFlg: boolean;
  section: Section;
  handleCommentSubmit: (
    comment: string,
    crud: string,
    commentNo?: number | undefined
  ) => Promise<void>;
};

/**
 * @description
 * リプライコンポーネント
 */
export default function Reply({
  session,
  replyAreaOpenFlg,
  section,
  handleCommentSubmit,
}: Props) {
  return (
    <div
      className={`${styles.replyArea} ${
        replyAreaOpenFlg ? styles.replyAreaOpen : styles.replyAreaClose
      }`}
    >
      {section.sectionComment?.map((comment, index) => (
        <ReplyComment
          key={index}
          viewerId={session.employee.id}
          sectionComment={comment}
          handleCommentSubmit={handleCommentSubmit}
        />
      ))}
    </div>
  );
}

/**
 * @description
 * リプライコメントコンポーネント
 */
function ReplyComment({
  viewerId,
  sectionComment,
  handleCommentSubmit,
}: {
  viewerId: number;
  sectionComment: SectionComment;
  handleCommentSubmit: (
    comment: string,
    crud: string,
    commentNo?: number | undefined
  ) => Promise<void>;
}) {
  const [editFlg, setEditFlg] = useState<boolean>(false);
  const [comment, setComment] = useState<string>(sectionComment.content);

  const replyEditContentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setComment(sectionComment.content);
    handleReplyEditContentInput();
  }, [sectionComment]);

  const editCancel = useCallback(() => {
    setComment(sectionComment.content);
  }, [sectionComment]);

  const handleReplyEditContentInput = () => {
    const textarea = replyEditContentRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // 高さをリセット
      textarea.style.height = `${textarea.scrollHeight}px`; // コンテンツの高さに合わせて調整
    }
  };

  return (
    <div key={sectionComment.commentNo} className={styles.reply}>
      <div className={styles.replyHeader}>
        <div>
          <span className={styles.replyEmployee}>
            {sectionComment.employeeName}
          </span>
          <span className={styles.replyDate}>
            {dayjs(sectionComment.updatedAt).format("YYYY/MM/DD HH:mm")}
          </span>
          {dayjs(sectionComment.updatedAt).isAfter(
            dayjs(sectionComment.createdAt)
          ) && <span className={styles.replyRevise}>(編集済)</span>}
        </div>
        {viewerId === sectionComment.employeeId && (
          <ReplyPopover
            editFlg={editFlg}
            setEditFlg={setEditFlg}
            handleCommentSubmit={handleCommentSubmit}
            commentNo={sectionComment.commentNo}
            editCancel={editCancel}
          />
        )}
      </div>
      <div className={styles.replyEditArea}>
        <textarea
          ref={replyEditContentRef}
          onInput={handleReplyEditContentInput}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="内容を入力してください"
          className={`${styles.replyEditContent} ${
            editFlg ? "" : styles.replyEditContentReadOnly
          }`}
          readOnly={!editFlg}
        />
        {editFlg && (
          <div>
            <Button
              className="justify-content-end"
              size="sm"
              onClick={async () => {
                await handleCommentSubmit(
                  comment,
                  CodeCRUD.update.code,
                  sectionComment.commentNo
                );
                setEditFlg(false);
              }}
            >
              修正
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @description
 * ポップオーバーコンポーネント
 */
function ReplyPopover({
  editFlg,
  setEditFlg,
  handleCommentSubmit,
  commentNo,
  editCancel,
}: {
  editFlg: boolean;
  setEditFlg: Dispatch<React.SetStateAction<boolean>>;
  handleCommentSubmit: (
    comment: string,
    crud: string,
    commentNo?: number | undefined
  ) => Promise<void>;
  commentNo: number;
  editCancel: () => void;
}) {
  const [listOpenFlg, setListOpenFlg] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const popverRef = useRef<HTMLDivElement>(null);
  const listItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // popover枠外をクリックでpopoverを閉じる
    const handleClickOutside = (e: MouseEvent | Event) => {
      if (
        listOpenFlg &&
        listItemRef.current &&
        !listItemRef.current.contains(e.target as Node)
      ) {
        setListOpenFlg(false);
      }
    };

    // popoverの位置を計算して設定
    if (listOpenFlg && popverRef.current) {
      const rect = popverRef.current.getBoundingClientRect(); // popoverの位置を取得
      const menuHeight = popverRef.current?.offsetHeight || 0; // popoverの高さを取得
      const spaceBelow = window.innerHeight - rect.bottom; // 下のスペースを計算

      // 画面余白を考慮してpopoverの位置を調整
      if (spaceBelow < menuHeight) {
        // 下にスペースがない場合は上に表示
        setPosition({
          top: rect.top + window.scrollY - menuHeight - 10, // 必要に応じて調整
          right: rect.right + window.scrollX - 190, // 必要に応じて調整
        });
      } else {
        // 通常の下に表示
        setPosition({
          top: rect.bottom + window.scrollY - 30,
          right: rect.right + window.scrollX - 195,
        });
      }
    }

    // 特定のオペレーションによるイベントリスナー追加
    if (listOpenFlg) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleClickOutside, true);
    }

    // クリーンアップ関数でイベントリスナーを削除
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleClickOutside, true);
    };
  }, [listOpenFlg]);

  return (
    <div className={styles.replyPopover} ref={popverRef}>
      <button
        onClick={() => {
          setListOpenFlg((prev) => !prev && true);
        }}
        className={styles.replyPopoverButton}
        disabled={listOpenFlg}
      >
        <CiMenuKebab size={25} />
      </button>

      {listOpenFlg && (
        <ReplyPortal>
          <div
            ref={listItemRef}
            className={styles.replyPopoverList}
            style={{ top: `${position.top}px`, left: `${position.right}px` }}
          >
            <ul className={styles.replyPopoverListUl}>
              <li
                className={styles.replyPopoverListli}
                onClick={() => {
                  if (editFlg) {
                    editCancel();
                  }
                  setEditFlg((prev) => !prev);
                  setListOpenFlg(false);
                }}
              >
                {editFlg ? (
                  <>
                    <GiCancel />
                    <span>編集をやめる</span>
                  </>
                ) : (
                  <>
                    <HiMiniPencilSquare />
                    <span>コメントを編集する</span>
                  </>
                )}
              </li>
              <li
                className={styles.replyPopoverListli}
                onClick={async () => {
                  await handleCommentSubmit(
                    "",
                    CodeCRUD.delete.code,
                    commentNo
                  );
                  setListOpenFlg(false);
                }}
              >
                <FaRegTrashCan />
                <span>コメントを削除する</span>
              </li>
            </ul>
          </div>
        </ReplyPortal>
      )}
    </div>
  );
}

type PortalProps = {
  children: React.ReactNode;
};

/**
 * @description
 * ポップオーバーabsolute化
 */
const ReplyPortal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("portal-root");
  return portalRoot ? createPortal(children, portalRoot) : null;
};
