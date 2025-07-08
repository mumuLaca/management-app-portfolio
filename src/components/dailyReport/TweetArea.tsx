import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  useMemo,
  useCallback,
  JSX,
} from "react";
import styles from "@/styles/DailyReport.module.css";
import { Alert, Badge, Button, ButtonGroup, Spinner } from "react-bootstrap";
import useSWR, { Fetcher } from "swr";
import axios from "axios";
import dayjs from "dayjs";
import {
  ApprovalStatusDailyReport,
  CodeCRUD,
  DailyReportAuthority,
  DailyReportType,
  IssueStatus,
} from "@/lib/constants";
import { getDailyReportTypeKey } from "@/utils/constantsUtil";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import {
  DailyReportPost,
  Issue,
  PostSection,
  SectionComment,
} from "@prisma/client";
import { MdOutlineUpdate } from "react-icons/md";
import Tweet from "./Tweet";
import type { DailyReportCommonUrlParams } from "@/types/types";
import { LuClipboardCopy } from "react-icons/lu";
import { LuClipboardPaste } from "react-icons/lu";
import isEqual from "lodash/isEqual";
import ApprovalButton from "./ApprovalButton";
import { FaList } from "react-icons/fa";
import Issues from "./Issues";
import { MdEditCalendar } from "react-icons/md";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import ModalIssueEntry from "./ModalIssueEntry";
import { Session } from "next-auth";
import { MdSaveAs } from "react-icons/md";
import { BsCalendar2WeekFill } from "react-icons/bs";
/** fetcher */
const fetcher: Fetcher<CombinedDailyReportPostProps, string> = (url) =>
  axios.get(url).then((res) => res.data);

export interface Section {
  postId?: string;
  indexNo: number;
  title: string;
  content: string;
  sectionComment?: SectionComment[];
}

interface PostSectionWithComment extends PostSection {
  sectionComment: SectionComment[];
}

export interface CombinedDailyReportPostProps extends DailyReportPost {
  postSection: PostSectionWithComment[];
  issues?: Issue[];
  authority?: string;
}

interface DailyReportCommonProps {
  session: Session;
  urlParams: DailyReportCommonUrlParams;
  sessionStatus?: "loading" | "authenticated" | "unauthenticated";
  date: Date;
  setPostDataUpdateFlg: (value: boolean) => void;
  setModalTweetInfoOpenFlg: Dispatch<React.SetStateAction<boolean>>;
}

export default function TweetArea({
  session,
  urlParams,
  sessionStatus,
  date,
  setPostDataUpdateFlg,
  setModalTweetInfoOpenFlg,
}: DailyReportCommonProps) {
  /** デフォルトのセクション定義 */
  const createDefaultSections = () => {
    switch (urlParams.dailyReportType) {
      // 日報
      case DailyReportType.daily.code:
        return [
          { title: "本日の目標", content: "", indexNo: 1 },
          { title: "作業内容、結果", content: "", indexNo: 2 },
          { title: "感想、課題、反省点", content: "", indexNo: 3 },
          { title: "対策、解決策", content: "", indexNo: 4 },
          { title: "明日の目標", content: "", indexNo: 5 },
        ];
      // 週報
      case DailyReportType.weekly.code:
        return [
          { title: "今週の目標", content: "", indexNo: 1 },
          { title: "作業内容と、その結果", content: "", indexNo: 2 },
          { title: "感想、課題、反省点", content: "", indexNo: 3 },
          { title: "対策、解決策", content: "", indexNo: 4 },
          { title: "次週の目標", content: "", indexNo: 5 },
        ];
      // 月報
      case DailyReportType.monthly.code:
        return [
          { title: "今月の目標", content: "", indexNo: 1 },
          { title: "作業内容、結果", content: "", indexNo: 2 },
          { title: "感想、課題、反省点", content: "", indexNo: 3 },
          { title: "対策、解決策", content: "", indexNo: 4 },
          { title: "次月の目標", content: "", indexNo: 5 },
        ];
      // 四半期報
      default:
        return [
          { title: "当期目標", content: "", indexNo: 1 },
          { title: "作業内容、結果", content: "", indexNo: 2 },
          { title: "感想、課題、反省点", content: "", indexNo: 3 },
          { title: "対策、解決策", content: "", indexNo: 4 },
        ];
    }
  };

  const [previousSection, setPreviousSection] = useState<Section[]>(
    createDefaultSections
  );
  const [sections, setSections] = useState<Section[]>(createDefaultSections);
  const [addSectionFlg, setAddSectionFlg] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [alert, setAlert] = useState<JSX.Element>(<></>);
  const [allCopyMsg, setAllCopyMsg] = useState<string>("AllCopy");
  const [allPasteMsg, setAllPasteMsg] = useState<string>("AllPaste");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesChangeFlg, setIssuesChangeFlg] = useState<boolean>(true);
  const [issueModalOpenFlg, setIssueModalOpenFlg] = useState<boolean>(false);
  const [switchTabFlg, setSwitchTabFlg] = useState<boolean>(true); // ツイート、課題一覧のタブ切り替えフラグ

  const [issueCRUDFlg, setIssueCRUDFlg] = useState(""); // 課題CRUDフラグ
  const [targetIssue, setTargetIssue] = useState<Issue | undefined>(undefined); // 課題CRUD対象の課題
  const [authority, setAuthority] = useState<string>(""); // 部屋主の権限情報

  const { roomId, dailyReportType } = urlParams as DailyReportCommonUrlParams;
  const formattedDate = useMemo(() => dayjs(date).format("YYYY-MM-DD"), [date]);

  const {
    data: tweetData,
    mutate,
    isLoading,
  } = useSWR(
    session
      ? `/api/dailyReport/get/${roomId}/${formattedDate}/${session.employee.id}`
      : null,
    fetcher,
    {
      onSuccess: (data) => {
        setSections(data?.postSection ?? createDefaultSections());
        setPreviousSection(data?.postSection ?? createDefaultSections());
        setAuthority(data.authority ?? DailyReportAuthority.mySelf.code);
      },
    }
  );

  /** 課題一覧の内容が更新された場合、最新データを取得 */
  useEffect(() => {
    const getIssues = async () => {
      if (issuesChangeFlg) {
        const res = await axios.get("/api/dailyReport/get/issues", {
          params: { roomId: roomId },
        });

        setIssues(res.data);
        setIssuesChangeFlg(false);
      }
    };

    getIssues();
  }, [issuesChangeFlg, roomId]);

  /** セクション追加時に画面をスクロール */
  useEffect(() => {
    if (addSectionFlg) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setAddSectionFlg(false);
    }
  }, [sections, addSectionFlg]);

  /** 一括更新モーダルで更新後の処理 */
  const handleBulkUpdateComplete = useCallback(async () => {
    mutate();
    setPostDataUpdateFlg(true);
  }, [mutate, setPostDataUpdateFlg]);

  // セッション取得中はローディングスピナーを表示
  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  /** 画面TOPへスクロール */
  const openContents = () => {
    document.getElementById("top")?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  /** 一時保存処理 */
  const saveTemporary = async () => {
    await axios
      .post("/api/dailyReport/update/dailyReportPost", {
        sections: sections,
        postId: tweetData?.postId ?? "",
        roomId: roomId,
        date: dayjs(date).format("YYYY-MM-DD"),
        status: ApprovalStatusDailyReport.saveTemporary.code,
      })
      .then((response) => {
        mutate().then(() => {
          openContents();
          setAlert(<Alert variant="success">一時保存しました。</Alert>);
          setPostDataUpdateFlg(true);
          console.info("一時保存成功", response.data);
        });
      })
      .catch((error) => {
        openContents();
        setAlert(<Alert variant="danger">一時保存に失敗しました。</Alert>);
        console.error("一時保存失敗", error);
      })
      .finally(() => {
        setTimeout(() => {
          setAlert(<></>);
        }, 1500); // 1.5秒後にメッセージを消す
      });
  };

  /** 提出処理 */
  const handleSubmitted = async (approvalStatus: string) => {
    await axios
      .post("/api/dailyReport/update/dailyReportPost", {
        sections: sections,
        postId: tweetData?.postId ?? "",
        roomId: roomId,
        date: dayjs(date).format("YYYY-MM-DD"),
        status: approvalStatus,
      })
      .then((response) => {
        mutate().then(() => {
          openContents();
          setAlert(<Alert variant="success">提出が完了しました。</Alert>);
          setPostDataUpdateFlg(true);
          console.info("提出処理成功", response.data);
        });
      })
      .catch((error) => {
        openContents();
        setAlert(
          <Alert variant="danger">
            提出に失敗しました。管理本部にお問い合わせください。
          </Alert>
        );
        console.error("提出処理失敗", error);
      })
      .finally(() => {
        setTimeout(() => {
          setAlert(<></>);
        }, 1500); // 1.5秒後にメッセージを消す
      });
  };

  /** セクションを追加 */
  const handleAddSection = () => {
    setSections((prevSections) => {
      const newSections = [...prevSections];
      const newSection: Section = {
        title: "",
        content: "",
        indexNo: prevSections.length + 1,
      };
      newSections.push(newSection);
      return newSections;
    });
    setAddSectionFlg(true);
  };

  /** セクションの編集可否を判定 */
  const isEditNow = () => {
    const status = tweetData?.status;

    // 以下条件でセクションの編集を許可
    // ・入力中
    // ・一時保存中
    // ・育成担当者差戻
    // ・本社差戻
    return (
      !status ||
      status === ApprovalStatusDailyReport.noInput.code ||
      status === ApprovalStatusDailyReport.saveTemporary.code ||
      status === ApprovalStatusDailyReport.firstPending.code ||
      status === ApprovalStatusDailyReport.secondPending.code
    );
  };

  /** 対象日付のセクションデータをクリップボードにコピー */
  const handleAllCopy = () => {
    // ストレージにセクションデータを保存
    localStorage.setItem("sectionDataTmp", JSON.stringify(sections));
    // コピー完了のメッセージを表示
    setAllCopyMsg("OK!");
    setTimeout(() => {
      setAllCopyMsg("AllCopy");
    }, 1000); // 1秒後にメッセージを元に戻す
  };

  /** ツイート（全セクション）のペースト */
  const handleAllPaste = () => {
    // ストレージからセクションデータを取得
    const sectionDataTmp = localStorage.getItem("sectionDataTmp");
    if (sectionDataTmp) {
      // セクションデータをパースして状態にセット
      const parsedSections = JSON.parse(sectionDataTmp);
      setSections(parsedSections);
      // ペースト完了のメッセージを表示
      setAllPasteMsg("OK!");
      setTimeout(() => {
        setAllPasteMsg("AllPaste");
        localStorage.removeItem("sectionDataTmp"); // コピーしたデータを削除
      }, 1000); // 1秒後にメッセージを元に戻す
    } else {
      setAllPasteMsg("データないよ！");
      setTimeout(() => {
        setAllPasteMsg("AllPaste");
        localStorage.removeItem("sectionDataTmp"); // 念のためコピーしたデータを削除
      }, 1000); // 1秒後にメッセージを元に戻す
    }
  };

  /** 承認状況を更新 */
  const handleUpdateApproval = async (approvalStatus: string) => {
    try {
      // 承認状況を更新
      await axios
        .post("/api/dailyReport/update/approvalStatus", {
          postId: tweetData!.postId,
          approvalStatus: approvalStatus,
        })
        .then((response) => {
          mutate().then(() => {
            setAlert(<Alert variant="success">承認状況を更新しました。</Alert>);
            setPostDataUpdateFlg(true); // 投稿データ更新フラグを立てる
            setTimeout(() => {
              setAlert(<></>);
            }, 1500); // 1.5秒後にメッセージを消す
            console.info("承認状況更新成功", response.data);
          });
        });

      // 画面更新
    } catch (err: unknown) {
      console.error(err);
    }
  };

  /** 画面左上の日付項目表示設定 */
  const displayRange = () => {
    switch (urlParams.dailyReportType) {
      // 日報
      case DailyReportType.daily.code:
        return (
          <div className={styles.tweetDate}>
            <span className={styles.tweetDateMM}>
              {dayjs(date).format("MM")}
            </span>
            <span className={styles.tweetDateDD}>
              {dayjs(date).format("DD")}
            </span>
          </div>
        );
      // 週報
      case DailyReportType.weekly.code:
        return (
          <div className="d-flex gap-2 align-items-center">
            <div className={styles.tweetDate}>
              <span className={styles.tweetDateMM}>
                {dayjs(date).format("MM")}
              </span>
              <span className={styles.tweetDateDD}>
                {dayjs(date).format("DD")}
              </span>
            </div>
            <div className="fw-bold">～</div>
            <div className={styles.tweetDate}>
              <span className={styles.tweetDateMM}>
                {dayjs(date).add(5, "day").format("MM")}
              </span>
              <span className={styles.tweetDateDD}>
                {dayjs(date).add(5, "day").format("DD")}
              </span>
            </div>
          </div>
        );
      // 月報
      case DailyReportType.monthly.code:
        return (
          <div className={styles.tweetDate}>
            <span className={styles.tweetDateMM}>
              {dayjs(date).format("YY")}
            </span>
            <span className={styles.tweetDateDD}>
              {dayjs(date).format("MM")}
            </span>
          </div>
        );
      // 四半期報
      case DailyReportType.quarter.code:
        let displayText = "";
        switch (dayjs(date).format("MM")) {
          case "04":
            displayText = "Q1";
            break;
          case "07":
            displayText = "Q2";
            break;
          case "10":
            displayText = "Q3";
            break;
          case "01":
            displayText = "Q4";
            break;
        }
        return (
          <div className={styles.tweetDate}>
            <span className="fs-3">{displayText}</span>
          </div>
        );
    }
  };

  return (
    <>
      <div id="top" />
      <div className={styles.tweetArea}>
        {alert}
        <div className={styles.tweetHeader}>
          <div className={styles.tweetHeaderButtonList}>
            {displayRange()}
            <div>
              <ButtonGroup aria-label="Basic example">
                <Button
                  variant={switchTabFlg ? "primary" : "outline-primary"}
                  onClick={() => {
                    setSwitchTabFlg(true);
                  }}
                >
                  <MdEditCalendar />
                  <span className={styles.mobileHiddenItem}>
                    {
                      DailyReportType[getDailyReportTypeKey(dailyReportType)]
                        .name
                    }
                  </span>
                </Button>
                <Button
                  variant={!switchTabFlg ? "primary" : "outline-primary"}
                  onClick={() => {
                    setSwitchTabFlg(false);
                  }}
                >
                  <FaList />
                  <span className={`ms-1 ${styles.mobileHiddenItem}`}>
                    課題一覧
                  </span>
                  {(issues?.length ?? 0) > 0 && (
                    <Badge bg="secondary" className="ms-2">
                      {
                        issues.filter(
                          (issue) =>
                            issue.status === IssueStatus.inComplete.code ||
                            issue.status === IssueStatus.onGoing.code
                        ).length
                      }
                    </Badge>
                  )}
                </Button>
              </ButtonGroup>
              <Button
                variant="dark"
                onClick={() => setModalTweetInfoOpenFlg(true)}
                className={styles.tweetInfoModalButton}
              >
                <BsCalendar2WeekFill />
              </Button>
            </div>
          </div>
          {switchTabFlg ? (
            <div className={styles.twewetHeaderTab}>
              <button
                onClick={() => {
                  mutate();
                }}
                className={styles.updateButton}
              >
                <MdOutlineUpdate />
              </button>
              {authority === DailyReportAuthority.mySelf.code && (
                <>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className={`d-flex align-items-center ${styles.convButton}`}
                    onClick={handleAllCopy}
                  >
                    <LuClipboardCopy />
                    <span className={styles.mobileHiddenItem}>
                      {allCopyMsg}
                    </span>
                  </Button>
                  {(!tweetData?.status ||
                    tweetData?.status ===
                      ApprovalStatusDailyReport.noInput.code ||
                    tweetData?.status ===
                      ApprovalStatusDailyReport.saveTemporary.code) && (
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className={`d-flex align-items-center ${styles.convButton}`}
                      onClick={handleAllPaste}
                    >
                      <LuClipboardPaste />
                      <span className={styles.mobileHiddenItem}>
                        {allPasteMsg}
                      </span>
                    </Button>
                  )}
                </>
              )}
              {isEditNow() &&
                authority === DailyReportAuthority.mySelf.code && (
                  <button
                    onClick={saveTemporary}
                    className={`${styles.tweetButton} ${styles.convButton}`}
                    disabled={isEqual(sections, previousSection)}
                  >
                    <MdSaveAs />
                    <span className={styles.mobileHiddenItem}>一時保存</span>
                  </button>
                )}
              <ApprovalButton
                approvalStatus={
                  tweetData?.status ?? ApprovalStatusDailyReport.noInput.code
                }
                authority={authority}
                urlParams={urlParams}
                changeFlg={isEqual(sections, previousSection)}
                handleSubmitted={handleSubmitted}
                handleUpdateApproval={handleUpdateApproval}
                handleBulkUpdateComplete={handleBulkUpdateComplete}
              />
            </div>
          ) : (
            authority === DailyReportAuthority.mySelf.code && (
              <>
                <div className={styles.twewetHeaderTab}>
                  <Button
                    variant="dark"
                    onClick={() => {
                      setTargetIssue({
                        roomId: roomId,
                        issueNo: (issues?.length ?? 0) + 1,
                        date: dayjs().toDate(),
                        category: "",
                        content: "",
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
                    <MdOutlinePlaylistAdd className="me-1" />
                    <span className={styles.displayItem}>課題登録</span>
                  </Button>
                </div>
              </>
            )
          )}
        </div>
        {switchTabFlg ? (
          <>
            {sections.map((section, index) => (
              <Tweet
                key={index}
                index={index}
                session={session!}
                urlParams={urlParams}
                date={date!}
                authority={authority}
                approvalStatus={
                  tweetData?.status ?? ApprovalStatusDailyReport.noInput.code
                }
                section={section}
                issues={issues}
                sections={sections}
                setSections={setSections}
                setIssueModalOpenFlg={setIssueModalOpenFlg}
                setTargetIssue={setTargetIssue}
                setIssueCRUDFlg={setIssueCRUDFlg}
                mutate={mutate}
              />
            ))}
            {isEditNow() &&
              authority === DailyReportAuthority.mySelf.code &&
              sections.length < 8 && (
                <div className="w- 100 d-flex justify-content-center">
                  <button
                    className={styles.tweetAddButton}
                    onClick={handleAddSection}
                  >
                    <div className={styles.tABIcon}>
                      <IoMdAddCircleOutline className={styles.tABNormal} />
                      <IoMdAddCircle className={styles.tABHover} />
                    </div>
                    <span>セクションを追加</span>
                  </button>
                </div>
              )}
          </>
        ) : (
          <Issues
            switchTabFlg={switchTabFlg}
            issues={issues}
            setIssueModalOpenFlg={setIssueModalOpenFlg}
            setTargetIssue={setTargetIssue}
            setIssueCRUDFlg={setIssueCRUDFlg}
            authority={authority}
          />
        )}
        {/* 一番下のダミー要素 */}
        <div ref={bottomRef} />
      </div>
      <ModalIssueEntry
        targetIssue={targetIssue}
        categories={[...new Set(issues?.map((i) => i.category))]}
        issueCRUDFlg={issueCRUDFlg}
        issueModalOpenFlg={issueModalOpenFlg}
        setIssueModalOpenFlg={setIssueModalOpenFlg}
        setIssuesChangeFlg={setIssuesChangeFlg}
      />
    </>
  );
}
