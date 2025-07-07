import { DailyReportType } from "@/lib/constants";
import { DailyReportCommonUrlParams } from "@/pages/dailyReport/[...slug]";
import { SectionComment } from "@prisma/client";
import { Dispatch, useEffect, useRef, useState } from "react";
import styles from "@/styles/DailyReport.module.css";
import dayjs from "dayjs";
import { Alert, Button } from "react-bootstrap";
import { AiOutlineComment } from "react-icons/ai";
import { TbMessageReply } from "react-icons/tb";
import Comment from "./Comment";
import Reply from "./Reply";
import { Session } from "next-auth";
import axios from "axios";
import { url } from "inspector";
import { BsCalendar2WeekFill } from "react-icons/bs";

interface ReportCover {
  postId: string;
  roomId: string;
  yearMonth: string;
  dailyReportType: string;
}

interface Section {
  indexNo: number;
  title: string;
  content: string;
  sectionComment?: SectionComment[];
}

// componentPropsの型定義
interface Props {
  session: Session;
  urlParams: DailyReportCommonUrlParams;
  date: Date;
  coverOpenFlg: boolean;
  setModalTweetInfoOpenFlg: Dispatch<React.SetStateAction<boolean>>;
}

/**
 * @description
 * 週報、四半期報の表紙を表示するコンポーネント
 */
export default function ReportCover({
  session,
  urlParams,
  date,
  coverOpenFlg,
  setModalTweetInfoOpenFlg,
}: Props) {
  /** デフォルトのセクション定義 */
  const createDefaultSections = () => {
    switch (urlParams.dailyReportType) {
      // 週報
      case DailyReportType.weekly.code:
        return [
          { title: "今月の目標", content: "", indexNo: 1 },
          { title: "達成状況", content: "", indexNo: 2 },
        ];
      // 四半期報
      default:
        return [
          { title: "年度目標", content: "", indexNo: 1 },
          { title: "達成状況", content: "", indexNo: 2 },
        ];
    }
  };

  const [reportCoverData, setReportCoverData] = useState<
    ReportCover | undefined
  >();
  const [sections, setSections] = useState<Section[]>(createDefaultSections);
  const [updateFlg, setUpdateFlg] = useState<boolean>(false);
  const [msg, setMsg] = useState<JSX.Element>(<></>);

  useEffect(() => {
    const fetchSections = async () => {
      const res = await axios.get("/api/dailyReport/get/coverSection", {
        params: {
          roomId: urlParams.roomId,
          dailyReportType: urlParams.dailyReportType,
          yearMonth: dayjs(date).format("YYYYMM"),
        },
      });

      if (res.data) {
        setReportCoverData({
          postId: res.data.postId,
          roomId: res.data.roomId,
          yearMonth: res.data.yearMonth,
          dailyReportType: res.data.dailyReportType,
        });
        setSections(res.data.section);
        setUpdateFlg(false); // セクション更新フラグを下げる
      }
    };

    if (coverOpenFlg || updateFlg) {
      fetchSections();
    }
  }, [coverOpenFlg, updateFlg, date, urlParams]);

  /** セクションの内容変更を保存 */
  const handleSectionChange = (
    index: number,
    field: "content",
    value: string
  ) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const handleSave = async () => {
    await axios.post("/api/dailyReport/update/coverSection", {
      postId: reportCoverData?.postId ?? "",
      roomId: reportCoverData?.roomId ?? urlParams.roomId,
      yearMonth: reportCoverData?.yearMonth ?? dayjs(date).format("YYYYMM"),
      dailyReportType:
        reportCoverData?.dailyReportType ?? urlParams.dailyReportType,
      sections: sections,
    });
    setUpdateFlg(true); // セクション更新フラグを下げる
    setMsg(<Alert variant="success">登録が完了しました。</Alert>);

    setTimeout(() => {
      setMsg(<></>);
    }, 1500); // 1.5秒後にメッセージを消す
  };

  return (
    <>
      <div className={styles.tweetArea}>
        <div className="pb-3 d-flex justify-content-between align-items-center">
          <div className="fs-4 fw-bold">
            {urlParams.dailyReportType === DailyReportType.weekly.code ? (
              <>{`${dayjs(date).format("YYYY年MM月")}`}</>
            ) : (
              <>{`${dayjs(date).format("YYYY年度")}`}</>
            )}
          </div>
          <div>
            <Button
              variant={reportCoverData ? "success" : "primary"}
              className="px-4"
              onClick={() => handleSave()}
            >
              {reportCoverData ? "更新" : "登録"}
            </Button>
            <Button
              variant="dark"
              onClick={() => setModalTweetInfoOpenFlg(true)}
              className={styles.tweetInfoModalButton}
            >
              <BsCalendar2WeekFill />
            </Button>
          </div>
        </div>
        {msg}
        {sections.map((section, index) => (
          <CoverSection
            key={index}
            index={index}
            session={session}
            handleSectionChange={handleSectionChange}
            reportCoverData={reportCoverData}
            section={section}
            setUpdateFlg={setUpdateFlg}
          />
        ))}
      </div>
    </>
  );
}

function CoverSection({
  index,
  session,
  handleSectionChange,
  reportCoverData,
  section,
  setUpdateFlg,
}: {
  index: number;
  session: Session;
  handleSectionChange: (index: number, field: "content", value: string) => void;
  reportCoverData: ReportCover | undefined;
  section: Section;
  setUpdateFlg: Dispatch<React.SetStateAction<boolean>>;
}) {
  const [replyAreaOpenFlg, setReplyAreaOpenFlg] = useState<boolean>(false);
  const [commentAreaOpenFlg, setCommentAreaOpenFlg] = useState<boolean>(false);

  const reportContentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    handleReportContentInput(); // コンテンツの高さに合わせて調整
  }, [section.content]);

  /** コメント投稿処理 */
  const handleCommentSubmit = async (
    comment: string,
    crud: string,
    commentNo: number | undefined = undefined
  ) => {
    await axios
      .post("/api/dailyReport/update/coverSectionComment", {
        postId: reportCoverData!.postId,
        indexNo: section.indexNo,
        employeeId: session.employee.id,
        employeeName: session.employee.name,
        commentNo: commentNo,
        content: comment,
        data: dayjs().toDate(),
        crud: crud,
      })
      .then(() => {
        setUpdateFlg(true); // セクション更新フラグを立てる
        setCommentAreaOpenFlg(false); // コメントエリアを閉じる
        setReplyAreaOpenFlg(true); // リプライエリアを開く
      });
  };

  const handleReportContentInput = () => {
    const textarea = reportContentRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // 高さをリセット
      textarea.style.height = `${textarea.scrollHeight}px`; // コンテンツの高さに合わせて調整
    }
  };

  return (
    <div key={index} className={styles.tweetCard}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className={styles.sectionTitle}>{section.title}</div>
      </div>
      <div>
        <textarea
          ref={reportContentRef}
          onInput={handleReportContentInput}
          value={section.content}
          onChange={(e) =>
            handleSectionChange(index, "content", e.target.value)
          }
          className={styles.reportContent}
        />
      </div>
      {reportCoverData && (
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
