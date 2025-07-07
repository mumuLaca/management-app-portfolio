import React from "react";
import { Pagination } from "react-bootstrap";
import styles from "@/styles/Help.module.css";
import PageStatus1 from "./PageStatus1";
import PageStatus2 from "./PageStatus2";
import { BsCaretLeft, BsCaretRight } from "react-icons/bs";

/**
 * @description
 * ヘルプページ‗提出状況0（メインコンポーネント）
 */
export default function PageStatus0() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPageNum = 2; // ページ数が増えてきたら動的に取得する方法に変更した方がいいかも（fsとか）

  // pagination遷移
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div>
        <div className={styles.PNCPagination}>
          <h4 className={styles.PNCPageTitle}>勤務表管理</h4>
          <Pagination>
            <Pagination.Item
              className="d-flex align-items-center"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <BsCaretLeft />
              <span>prev</span>
            </Pagination.Item>
            <Pagination.Item
              className="d-flex align-items-center"
              disabled={currentPage === totalPageNum}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <span>next</span>
              <BsCaretRight />
            </Pagination.Item>
          </Pagination>
        </div>
        {currentPage === 1 ? <PageStatus1 /> : <></>}
        {currentPage === 2 ? <PageStatus2 /> : <></>}
      </div>
    </>
  );
}
