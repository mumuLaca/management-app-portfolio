import { useState } from "react";
import styles from "@/styles/DailyReport.module.css";
import { Button } from "react-bootstrap";
import { CodeCRUD } from "@/lib/constants";

type Props = {
  commentAreaOpenFlg: boolean;
  handleCommentSubmit: (
    comment: string,
    crud: string,
    commentNo?: number | undefined
  ) => Promise<void>;
};

/**
 * @description
 * コメントエリアコンポーネント
 */
export default function Cooment({
  commentAreaOpenFlg,
  handleCommentSubmit,
}: Props) {
  const [comment, setComment] = useState<string>("");
  return (
    <div
      className={`${styles.commentArea} ${
        commentAreaOpenFlg ? styles.commentAreaOpen : styles.commentAreaClose
      }`}
    >
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="内容を入力してください"
          className={styles.tweetContent}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            handleCommentSubmit(comment, CodeCRUD.create.code).then(() =>
              setComment("")
            );
          }}
        >
          コメント
        </Button>
      </div>
    </div>
  );
}
