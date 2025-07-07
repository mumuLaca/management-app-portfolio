import React from "react";
import Modal from "react-bootstrap/Modal";
import { Employee } from "@prisma/client";
import styles from "@/styles/CustomScroll.module.css";
import Header from "@/components/attendance/Header";
import List from "@/components/attendance/List";
import useSWR, { Fetcher } from "swr";
import { TypeMonthlyAttendance } from "@/types/attendance";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import Summary from "@/components/attendance/Summary";
import { TbFileReport } from "react-icons/tb";

interface Props {
  attendanceModalOpenFlg: boolean;
  setAttendanceModalOpenFlg: React.Dispatch<React.SetStateAction<boolean>>;
  employee: Employee;
  yearMonth: string;
}

/** fetcher */
const fetcher: Fetcher<TypeMonthlyAttendance, string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * 勤務表（参照用）モーダル
 */
export default function ModalAttendance({
  attendanceModalOpenFlg,
  setAttendanceModalOpenFlg,
  employee,
  yearMonth,
}: Props) {
  // 勤務表関連データ取得
  const { data, error, mutate, isLoading } = useSWR(
    yearMonth && employee?.id
      ? `/api/attendance/get/${yearMonth}/${employee.id}`
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
      show={attendanceModalOpenFlg}
      onShow={onShow}
      onHide={() => setAttendanceModalOpenFlg(false)}
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
                attendanceData={data!}
                setTargetyearMonth={null}
                editable={false}
                inputCheck={""}
              />
              <Summary attendanceData={data!} />
            </div>

            <main>
              <List
                employee={employee}
                attendanceData={data!}
                mutateAttendance={null}
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
