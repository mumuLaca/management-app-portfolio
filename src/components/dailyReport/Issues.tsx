import { CodeCRUD, DailyReportAuthority, IssueStatus } from "@/lib/constants";
import { Issue } from "@prisma/client";
import dayjs from "dayjs";
import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useState } from "react";
import { Button, Pagination, Table } from "react-bootstrap";
import styles from "@/styles/DailyReport.module.css";
import { getIssueStatusKey } from "@/utils/constantsUtil";

type Props = {
  switchTabFlg: boolean;
  issues?: Issue[];
  setIssueModalOpenFlg: React.Dispatch<React.SetStateAction<boolean>>;
  setTargetIssue: React.Dispatch<React.SetStateAction<Issue | undefined>>;
  setIssueCRUDFlg: React.Dispatch<React.SetStateAction<string>>;
  authority: string;
};

// 課題一覧のページネーションの1ページあたりのアイテム数
const ITEMS_PER_PAGE = 10;

/**
 * @description
 * 課題一覧モーダル
 */
export default function Issues({
  switchTabFlg,
  issues,
  setIssueModalOpenFlg,
  setTargetIssue,
  setIssueCRUDFlg,
  authority,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedIssues, setPaginatedIssues] = useState<Issue[]>([]);

  useEffect(() => {
    // タブの切り替え&課題の状態変更を検知した場合、ページネーションをリセット
    if (!switchTabFlg && issues) {
      setTotalPages(Math.ceil((issues.length ?? 0) / ITEMS_PER_PAGE));
      setPaginatedIssues(
        issues.slice(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE
        )
      );
    }
  }, [switchTabFlg, issues, currentPage]);

  return (
    <div>
      <Table bordered responsive>
        <thead>
          <tr className={styles.issuesTableHeader}>
            <th style={{ width: 65, minWidth: 65 }}>#</th>
            <th style={{ width: 80, minWidth: 80 }}>発生日</th>
            <th style={{ width: 120, minWidth: 120 }}>カテゴリ</th>
            <th style={{ width: 80, minWidth: 80 }}>状況</th>
            <th style={{ width: 400, minWidth: 400 }}>内容</th>
            <th style={{ width: 70, minWidth: 70 }}>実施日</th>
            <th style={{ width: 70, minWidth: 70 }}>完了日</th>
          </tr>
        </thead>
        <tbody className={styles.issuesTableBody}>
          {paginatedIssues?.map((issue) => (
            <tr
              key={issue.issueNo}
              className={`${styles.issuesRow} ${
                authority === DailyReportAuthority.mySelf.code ||
                styles.visibleHidden
              }`}
            >
              <td className="text-center">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    setTargetIssue(issue);
                    setIssueCRUDFlg(CodeCRUD.update.code);
                    setIssueModalOpenFlg(true);
                  }}
                >
                  更新
                </Button>
              </td>
              <td>{dayjs(issue.date).format("YY/M/D")}</td>
              <td>{issue.category}</td>
              <td>
                <span>
                  {IssueStatus[getIssueStatusKey(issue.status)].caption}
                </span>
              </td>
              <td>
                <span>{issue.content}</span>
              </td>
              <td>
                <span>
                  {issue.startDate ? dayjs(issue.startDate).format("M/D") : ""}
                </span>
              </td>
              <td>
                <span>
                  {issue.completeDate
                    ? dayjs(issue.completeDate)?.format("M/D")
                    : ""}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </div>
  );
}
