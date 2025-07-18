import React from "react";
import { Pagination } from "react-bootstrap";
import styles from "@/styles/Help.module.css";
import PageAttendance1 from "./PageAttendance1";
import PageAttendance2 from "./PageAttendance2";
import { BsCaretLeft, BsCaretRight } from "react-icons/bs";

/**
 * @description
 * ヘルプページ‗勤務表0（メインコンポーネント）
 */
export default function PageAttendance0() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const totalPageNum = 2; // ページ数が増えてきたら動的に取得する方法に変更した方がいいかも（fsとか）

  // pagination遷移
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div>
        <div className={styles.PNCPagination}>
          <h4 className={styles.PNCPageTitle}>勤務表記入要領</h4>
          <Pagination>
            <Pagination.Item
              className="d-flex align-items-center"
              disabled={currentPage === 0}
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
        {currentPage === 0 ? <PageAttendance1 /> : <></>}
        {currentPage === 1 ? <PageAttendance2 /> : <></>}
      </div>
    </>
  );
}
