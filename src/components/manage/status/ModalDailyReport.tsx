import React from "react";
import Modal from "react-bootstrap/Modal";
import { Employee } from "@prisma/client";
import styles from "@/styles/CustomScroll.module.css";
import Header from "@/components/daily/Header";
import List from "@/components/daily/List";
import useSWR, { Fetcher } from "swr";
import { TypeMonthlyDailyReport } from "@/types/daily";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import Summary from "@/components/daily/Summary";
import { TbFileReport } from "react-icons/tb";

interface Props {
  dailyReportModalOpenFlg: boolean;
  setDailyReportModalOpenFlg: React.Dispatch<React.SetStateAction<boolean>>;
  employee: Employee;
  yearMonth: string;
}

/** fetcher */
const fetcher: Fetcher<TypeMonthlyDailyReport, string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * 勤務表（参照用）モーダル
 */
export default function ModalDailyReport({
  dailyReportModalOpenFlg,
  setDailyReportModalOpenFlg,
  employee,
  yearMonth,
}: Props) {
  // 勤務表関連データ取得
  const { data, error, mutate, isLoading } = useSWR(
    yearMonth && employee?.id
      ? `/api/daily/get/${yearMonth}/${employee.id}`
      : null,
    fetcher
  );

  // useSWRによるデータ取得が失敗した場合
  if (error) {
    console.error(error);
    return <></>;
  }

  // モーダルOPEN時処理
  const onShow = () => {
    mutate();
  };

  return (
    <Modal
      show={dailyReportModalOpenFlg}
      onShow={onShow}
      onHide={() => setDailyReportModalOpenFlg(false)}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
    >
      <Modal.Header
        closeButton
        closeVariant="white"
        className="bg-success"
        style={{ color: "#fff" }}
      >
        <Modal.Title>
          <TbFileReport />
          <span className="ms-2">勤務表（参照用）</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`my-3 ${styles.scrollHidden}`}>
        {isLoading ? (
          <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            <Spinner animation="border" role="status" />
          </div>
        ) : (
          <>
            <div>
              <Header
                employee={employee}
                dailyReportData={data!}
                setTargetyearMonth={null}
                editable={false}
                inputCheck={""}
              />
              <Summary dailyReportData={data!} />
            </div>

            <main>
              <List
                employee={employee}
                dailyReportData={data!}
                mutateDailyReport={null}
                editable={false}
                setInputCheck={null}
              />
            </main>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
