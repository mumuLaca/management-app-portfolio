import { FixedHoliday, AbsentData, WorkStyle } from "@/lib/constants";
import { isHoliday } from "@holiday-jp/holiday_jp";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { KeyedMutator } from "swr";
import TimeList15 from "../common/TimeList15";
import styles from "@/styles/Attendance.module.css";
import { useWindowSize } from "@/lib/useWindowSize";
import { TypeMonthlyAttendance } from "@/types/attendance";
import ModalAllModify from "./ModalAllModify";
import { Employee } from "@prisma/client";
import { BsWrenchAdjustableCircle } from "react-icons/bs";

type Props = {
  employee: Employee;
  attendanceData: TypeMonthlyAttendance;
  mutateAttendance: KeyedMutator<TypeMonthlyAttendance>;
};

/**
 * @description
 * 一括登録アコーディオン
 */
export default function AllEntry({
  employee,
  attendanceData,
  mutateAttendance,
}: Props) {
  /** useState */
  const [workStartTime, setWorkStartTime] = useState(employee.startTime); // 始業時間
  const [workEndTime, setWorkEndTime] = useState(employee.endTime); // 終業時間
  const [restTime, setRestTime] = useState("1.00"); // 休憩時間
  const [workStyle, setWorkStyle] = useState(employee.basicWorkStyle); // 勤務形態

  const [isActive, setIsActive] = useState<boolean>(false); // アコーディオンの開閉フラグ
  const [modalShow, setModalShow] = useState<boolean>(false); // 一括修正モーダルの開閉フラグ
  const [width] = useWindowSize(); // ディスプレイ幅

  /* useEffect */
  useEffect(() => {
    // ディスプレイ幅992px以上
    if (width >= 992) {
      setIsActive(true);
    }
  }, [width]);

  /** 勤務一括登録 */
  const handleAllEntry = async () => {
    const days: dayjs.Dayjs[] = [];
    const startDate = dayjs(`${attendanceData.yearMonth}01`, "YYYYMMDD");
    const endDate = startDate.endOf("month");
    const enteredDates = attendanceData.list.map((item) =>
      dayjs(item.date).format("MM-DD")
    );
    // 登録する日付を選定
    for (
      let targetDate = startDate;
      targetDate <= endDate;
      targetDate = targetDate.add(1, "day")
    ) {
      // 以下の日付は一括登録対象としない
      // ・土日祝日
      // ・固定休日
      // ・登録済営業日
      if (
        targetDate.day() === 0 ||
        targetDate.day() === 6 ||
        isHoliday(targetDate.toDate()) ||
        FixedHoliday.includes(targetDate.format("MM-DD")) ||
        enteredDates.includes(targetDate.format("MM-DD"))
      ) {
        continue;
      } else {
        // 登録対象日付として追加
        days.push(targetDate);
      }
    }

    // APIパラメーター定義
    const data = {
      id: employee.id,
      targetDate: days.map((value) => dayjs(value).format("YYYY-MM-DD")),
      startTime: workStartTime,
      endTime: workEndTime,
      rest: restTime,
      workStyle: workStyle,
      absentCode: AbsentData.none.code,
      note: "",
      deleteFlg: "0",
    };

    // API発行（終了時にデータを最新化し、ローディングを解除）
    await axios
      .post("/api/attendance/entry", data)
      .then(() => mutateAttendance());
  };

  return (
    <>
      <Container className="mb-4" fluid={width < 992 ? true : false}>
        <div className={styles.accordion}>
          <div
            className={`${styles.contentBox} ${isActive ? styles.active : ""}`}
          >
            <div
              className={styles.titleArea}
              onClick={() => setIsActive(!isActive)}
            >
              <i
                className={`bi bi-arrow-down-circle-fill ${styles.arrow} `}
              ></i>
              <div className={styles.AllEntryBar}>
                <div className={styles.label}>一括登録</div>
                <div
                  className={`${styles.allEntry} ${
                    isActive ? styles.cardOpen : styles.cardClose
                  }`}
                  style={{ color: `var(--header-color)` }}
                >
                  <i
                    className="bi bi-exclamation-diamond mx-1"
                    style={{ color: `var(--header-color)` }}
                  ></i>
                  <div>
                    <div className={styles.annotation1}>
                      土日祝日を除く営業日が登録対象です。上書き不可。
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.content}>
              <Form>
                <Row className="align-items-center pb-2">
                  <Col xs={12} sm={12} md={6} lg={4} xl={4} className="pt-1">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: `var(--header-color)` }}
                    >
                      勤務時間
                    </Form.Label>
                    <Form.Group className="d-flex" as={Col}>
                      <Form.Control
                        className="w-100"
                        type="time"
                        value={workStartTime}
                        list="data-list-start-15"
                        onChange={(e) => setWorkStartTime(e.target.value)}
                        step="900"
                      />
                      <span className="fs-4 px-2">~</span>
                      <Form.Control
                        type="time"
                        value={workEndTime}
                        list="data-list-end-15"
                        onChange={(e) => setWorkEndTime(e.target.value)}
                        step="900"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} sm={3} md={3} lg={2} xl={2} className="pt-1">
                    <Form.Group className="fw-bold" as={Col}>
                      <Form.Label style={{ color: `var(--header-color)` }}>
                        休憩時間
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={restTime}
                        onChange={(e) => setRestTime(e.target.value)}
                        placeholder="1.00"
                        step="0.25"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} sm={3} md={3} lg={2} xl={2} className="pt-1">
                    <Form.Group className="fw-bold" as={Col}>
                      <Form.Label style={{ color: `var(--header-color)` }}>
                        勤務形態
                      </Form.Label>
                      <Form.Select
                        value={workStyle}
                        onChange={(e) => setWorkStyle(e.target.value)}
                      >
                        {Object.values(WorkStyle).map((obj) => (
                          <option key={obj.code} value={obj.code}>
                            {obj.mean}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={12} lg={4} xl={4}>
                    <Form.Label></Form.Label>
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="success"
                        onClick={handleAllEntry}
                        className="me-2 d-flex align-items-center"
                      >
                        <BsWrenchAdjustableCircle />
                        <span className="ps-2">
                          {width >= 768 && width < 1200 ? (
                            <>登録</>
                          ) : (
                            <>一括登録</>
                          )}
                        </span>
                      </Button>
                      <Button
                        disabled={!attendanceData?.list?.length}
                        variant={
                          attendanceData?.list?.length ? "dark" : "secondary"
                        }
                        onClick={() => setModalShow(true)}
                        className="d-flex align-items-center"
                      >
                        <BsWrenchAdjustableCircle />
                        <span className="ps-2">
                          {width >= 768 && width < 1200 ? (
                            <>修正</>
                          ) : (
                            <>一括修正</>
                          )}
                        </span>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
      </Container>
      <TimeList15 />
      <ModalAllModify
        show={modalShow}
        setModalShow={setModalShow}
        employee={employee}
        attendanceData={attendanceData}
        mutateAttendance={mutateAttendance}
      />
    </>
  );
}
