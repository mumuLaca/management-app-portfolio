"use client";

import { Employee } from "@prisma/client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";
import useSWR, { Fetcher } from "swr";
import { AdminRights } from "@/lib/constants";
import styles from "@/styles/CustomScroll.module.css";
import ModalConfirm from "@/components/modal/ModalConfirm";
import { MODALMESSAGE } from "@/lib/modalMessage";
import { adminRightsKey } from "@/utils/constantsUtil";
import { useSession } from "next-auth/react";
import { BsSearch } from "react-icons/bs";

interface FilEmployee {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const fetcher: Fetcher<Employee[], string> = (url) =>
  axios.get(url).then((res) => res.data);

/**
 * @description
 * メンバー情報更新‗メインコンポーネント
 */
export default function UpdateUserMain() {
  const [updatedEmployees, setUpdatedEmployees] = useState<Employee[] | null>();
  const [searchName, setSearchName] = useState("");
  const [updateIDs, setUpdateIDs] = useState<number[]>([]);
  const [modalShow, setModalShow] = React.useState(false);

  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();

  // メンバー情報の全件取得
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

  /** useEffect */
  useEffect(() => {
    if (employees) {
      setUpdatedEmployees(employees);
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

  /** 項目の値が変更された時 */
  const changeHandler = (changeValue: string, id: number, key: string) => {
    const setData = updatedEmployees?.map((item) => {
      if (item.id === id) {
        return { ...item, [key]: changeValue };
      } else {
        return item;
      }
    });

    setUpdatedEmployees(setData);

    const element = document.getElementById(`${key}_${id}`);

    // 変更項目の明示化とdefault化
    if (element != null) {
      let subjectItem = "";

      const matchData = setData?.find((upItem) => id === upItem.id);

      employees!.forEach((employee: FilEmployee) => {
        // 変更があったレコードに対し処理
        if (matchData && employee.id === matchData.id) {
          // 変更があったレコードに対し、初期レコード値と相違していた場合、変更用フラグにtrueをセット
          if (JSON.stringify(employee) !== JSON.stringify(matchData)) {
            setUpdateIDs(Array.from(new Set([...updateIDs, matchData.id])));
          } else {
            setUpdateIDs((updateIDs) =>
              updateIDs.filter((id) => id != matchData.id)
            );
          }

          // 変更したアイテムの初期値を取得
          subjectItem = employee[key];
          // 変更値と初期値に相違がある場合は入力欄のレイアウトを変更
          if (subjectItem != changeValue) {
            element.style.border = "1px solid green";
            element.style.backgroundColor = "#7cfc00";
          } else {
            element.style.border = "";
            element.style.backgroundColor = "#ffffff";
          }
        }
      });
    }
  };

  /** メンバー検索 */
  const handleSearch = () => {
    let filterRecords = employees;
    const setUpIds: number[] = [];

    // 空検索の場合は
    if (searchName.length <= 0) {
      window.location.reload();
      return;
    }

    // 全メンバー情報を検索ワードでフィルタリング
    filterRecords = employees!.filter((record) =>
      record.name.includes(searchName)
    );
    const setData = filterRecords.map((item) => {
      if (updateIDs.includes(item.id)) {
        setUpIds.push(item.id);
      }

      const matchData = updatedEmployees?.find(
        (upItem) => item.id === upItem.id
      );

      if (matchData) {
        return matchData;
      } else {
        return item;
      }
    });

    setUpdateIDs(setUpIds);
    setUpdatedEmployees(setData);
  };

  /** メンバー情報更新 */
  const updateEmployee = async () => {
    const updateData = updatedEmployees?.filter((employee) =>
      updateIDs.includes(employee.id)
    );

    await axios
      .post("/api/employee/update/all", {
        params: {
          updateEmployees: updateData,
        },
      })
      .finally(() => window.location.reload());
  };

  return (
    <div className="mt-3">
      <Form>
        <div className="d-flex justify-content-between mb-3 mx-3">
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

          <Button
            variant="success"
            type="button"
            className="px-4 fw-bold"
            onClick={() => setModalShow(true)}
          >
            更新
          </Button>
        </div>

        <div className={`h-100 ${styles.scrollHidden}`}>
          <Table bordered striped>
            <colgroup>
              <col style={{ minWidth: 100 }} />
              <col style={{ minWidth: 150 }} />
              <col style={{ minWidth: 250 }} />
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 100 }} />
            </colgroup>
            <thead>
              <tr>
                <th>メンバー番号</th>
                <th>氏名</th>
                <th>メールアドレス</th>
                <th>所属</th>
                <th>管理者権限</th>
              </tr>
            </thead>
            <tbody>
              {updatedEmployees?.map((employee: Employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>
                    <Form.Control
                      type="text"
                      defaultValue={employee.name}
                      id={`name_${employee.id}`}
                      onBlur={(e) => {
                        changeHandler(e.target.value, employee.id, "name");
                      }}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="email"
                      defaultValue={employee.email}
                      id={`email_${employee.id}`}
                      onBlur={(e) => {
                        changeHandler(e.target.value, employee.id, "email");
                      }}
                    />
                  </td>
                  <td>
                    <Form.Control
                      defaultValue={employee.section}
                      id={`section_${employee.id}`}
                      onBlur={(e) => {
                        changeHandler(e.target.value, employee.id, "section");
                      }}
                    />
                  </td>
                  <td>
                    <Form.Select
                      disabled={session!.employee.id === employee.id}
                      defaultValue={
                        AdminRights[adminRightsKey(employee.admin)].code
                      }
                      id={`admin_${employee.id}`}
                      onBlur={(e) => {
                        changeHandler(e.target.value, employee.id, "admin");
                      }}
                    >
                      <option value="0">{AdminRights.general.caption}</option>
                      <option value="1">{AdminRights.admin.caption}</option>
                      <option value="2">{AdminRights.leader.caption}</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Form>
      <ModalConfirm
        modalMessage={MODALMESSAGE.MM00401}
        show={modalShow}
        setModalShow={setModalShow}
        executeFunction={() => updateEmployee()}
      />
    </div>
  );
}
