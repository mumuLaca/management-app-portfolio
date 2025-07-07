import React from "react";
import Modal from "react-bootstrap/Modal";
import styles from "@/styles/CustomScroll.module.css";
import useSWR, { Fetcher } from "swr";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { Employee } from "@prisma/client";
import { TypeMonthlyReimbursement } from "@/types/reimbursement";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import Header from "@/components/reimbursement/Header";
import List from "@/components/reimbursement/List";

interface Props {
  reimbursementModalOpenFlg: boolean;
  setReimbursementModalOpenFlg: React.Dispatch<React.SetStateAction<boolean>>;
  employee: Employee;
  yearMonth: string;
}

/** fetcher */
const fetcher: Fetcher<TypeMonthlyReimbursement, string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * 立替精算表（参照用）モーダル
 */
export default function ModalReimbursement({
  reimbursementModalOpenFlg,
  setReimbursementModalOpenFlg,
  employee,
  yearMonth,
}: Props) {
  // 交通費精算関連データ取得
  const { data, error, mutate, isLoading } = useSWR(
    yearMonth && employee?.id
      ? `/api/reimbursement/get/${yearMonth}/${employee.id}`
      : null,
    fetcher
  );

  // useSWRによるデータ取得が失敗した場合
  if (error) {
    console.error(error);
    return <></>;
  }

  /** モーダルOPEN時処理 */
  const onShow = () => {
    mutate();
  };

  return (
    <Modal
      show={reimbursementModalOpenFlg}
      onShow={onShow}
      onHide={() => setReimbursementModalOpenFlg(false)}
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
          <AiOutlineMoneyCollect />
          <span className="ms-2">立替精算表（参照用）</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`my-3 h-auto ${styles.scrollHidden}`}>
        {isLoading ? (
          <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            <Spinner animation="border" role="status" />
          </div>
        ) : (
          <>
            <div>
              <Header
                employee={employee}
                reimbursementData={data!}
                yearMonth={yearMonth}
                setTargetyearMonth={null}
                editable={false}
                inputCheck={""}
              />
            </div>
            <main>
              <List
                employee={employee}
                reimbursementData={data!}
                mutateSettlement={null}
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
