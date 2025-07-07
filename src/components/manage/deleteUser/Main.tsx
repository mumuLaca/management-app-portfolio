"use client";

import { Employee } from "@prisma/client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import useSWR, { Fetcher } from "swr";
import { AdminRights, InitEmployeeInfo } from "@/lib/constants";
import styles from "@/styles/CustomScroll.module.css";
import ModalDeleteConfirm from "@/components/manage/deleteUser/ModalDeleteConfirm";
import { useSession } from "next-auth/react";
import { adminRightsKey } from "@/utils/constantsUtil";
import { BsSearch } from "react-icons/bs";

const fetcher: Fetcher<Employee[], string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * ユーザー削除‗メインコンポーネント
 */
export default function DeleteUserMain() {
  const [filterEmployees, setFilterEmployees] = useState<Employee[] | null>();
  const [searchName, setSearchName] = useState("");
  const [modalShow, setModalShow] = React.useState(false);
  const [deleteEmployee, setDeleteEmployee] =
    React.useState<Employee>(InitEmployeeInfo);

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();

  // 社員情報の全件取得
  const {
    data: employees,
    error,
    isLoading,
  } = useSWR("/api/employee/get/all", fetcher, {
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // 再試行は5回までしかできません。
      if (retryCount >= 5) return;

      // 5秒後に再試行します。
      setTimeout(() => revalidate({ retryCount }), 5000);
    },
  });

  useEffect(() => {
    if (employees) {
      setFilterEmployees(employees);
    }
  }, [employees]);

  // データ取得中はローディング
  if (sessionStatus === "loading" || isLoading || !employees) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // useSWRによるデータ取得が失敗した場合
  if (error) {
    // 画面を再描画
    window.location.reload();
  }

  // 検索ボタンが押された時
  // ※既に変更した項目値はリセット
  const handleSearch = () => {
    const filterRecords = searchName
      ? employees.filter((record: Employee) => record.name.includes(searchName))
      : employees;
    setFilterEmployees(filterRecords);
  };

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between mb-3 ms-3">
        <div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="氏名で検索"
              onChange={(e) => setSearchName(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                handleSearch();
              }}
            >
              <BsSearch />
            </Button>
          </div>
        </div>
      </div>

      <div className={`h-100 ${styles.scrollHidden}`}>
        <Table bordered striped>
          <colgroup>
            <col style={{ minWidth: 100 }} />
            <col style={{ minWidth: 120 }} />
            <col style={{ minWidth: 150 }} />
            <col style={{ minWidth: 250 }} />
            <col style={{ minWidth: 120 }} />
            <col style={{ minWidth: 100 }} />
          </colgroup>
          <thead>
            <tr>
              <th>削除</th>
              <th>社員番号</th>
              <th>氏名</th>
              <th>メールアドレス</th>
              <th>所属</th>
              <th>管理者権限</th>
            </tr>
          </thead>
          <tbody>
            {filterEmployees?.map((employee: Employee) => (
              <tr key={employee.id}>
                <td>
                  <Button
                    variant={
                      session?.employee.id === employee.id
                        ? "secondary"
                        : "danger"
                    }
                    className="px-4 fw-bold"
                    onClick={() => {
                      setDeleteEmployee(employee);
                      setModalShow(true);
                    }}
                    disabled={
                      session?.employee.id === employee.id ? true : false
                    }
                  >
                    削除
                  </Button>
                </td>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.section}</td>
                <td>{AdminRights[adminRightsKey(employee.admin)].caption}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <ModalDeleteConfirm
        show={modalShow}
        deleteEmployee={deleteEmployee}
        setModalShow={setModalShow}
      />
    </div>
  );
}
