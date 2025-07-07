"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import styles from "@/styles/Daily.module.css";
import { useWindowSize } from "@/lib/useWindowSize";
import { TypeMonthlyDailyReport } from "@/types/daily";
import { AbsentData } from "@/lib/constants";
import { BsArrowDownCircleFill } from "react-icons/bs";

/**
 * @description
 * 集計コンポーネント
 *
 * 勤務表の各種集計項目とその値を表示
 */
export default function Summary({
  dailyReportData,
}: {
  dailyReportData: TypeMonthlyDailyReport; // 勤務表データ
}) {
  const [isActive, setIsActive] = useState(false);
  const [width] = useWindowSize();

  /** useEffect */
  useEffect(() => {
    // ディスプレイ幅が992px以上の場合アコーディオンを開いた状態で初期表示
    if (width >= 992) {
      setIsActive(true);
    }
  }, [width]);

  /** 稼働時間算出 */
  const totalActiveTime = useMemo(
    () =>
      dailyReportData.list.reduce((sum, row) => {
        return sum + Number(row?.activeTime ?? 0);
      }, 0),
    [dailyReportData.list]
  );

  /** 残業時間算出 */
  const totalOverTime = useMemo(
    () =>
      dailyReportData.list.reduce((sum, row) => sum + (row?.overTime ?? 0), 0),
    [dailyReportData.list]
  );

  /** 深夜残業時間算出 */
  const totalLNOverTime = useMemo(
    () =>
      dailyReportData.list.reduce(
        (sum, row) => sum + Number(row?.lNOverTime ?? 0),
        0
      ),
    [dailyReportData.list]
  );

  /** 法定休日勤務時間算出 */
  const totalLHActiveTime = useMemo(
    () =>
      dailyReportData.list.reduce(
        (sum, row) => sum + Number(row?.legalHolActive ?? 0),
        0
      ),
    [dailyReportData.list]
  );

  /** 有給日数算数 */
  const totalVacation = useMemo(
    () =>
      dailyReportData.list.reduce((count, row) => {
        if (row.absentCode === AbsentData.allDayOff.code) {
          count += 1;
        } else if (row.absentCode === AbsentData.halfDayOff.code) {
          count += 0.5;
        }
        return count;
      }, 0),
    [dailyReportData.list]
  );

  /** 遅刻日数算出 */
  const totalLate = useMemo(
    () =>
      dailyReportData.list.reduce((count, row) => {
        if (row.absentCode === AbsentData.late.code) {
          count += 1;
        }
        return count;
      }, 0),
    [dailyReportData.list]
  );

  /** 相対日数算出 */
  const totalLeaveEarly = useMemo(
    () =>
      dailyReportData.list.reduce((count, row) => {
        if (row.absentCode === AbsentData.leaveEarly.code) {
          count += 1;
        }
        return count;
      }, 0),
    [dailyReportData.list]
  );

  return (
    <>
      <Container className="mb-3" fluid={width < 992 ? true : false}>
        <div className={styles.accordion}>
          <div
            className={`${styles.contentBox} ${isActive ? styles.active : ""}`}
            onClick={() => setIsActive(!isActive)}
          >
            <BsArrowDownCircleFill className={styles.arrow} />
            <div className={styles.label}>集計</div>
            <div className={styles.content}>
              <Row className="px-2">
                <Col xs={4} sm={3} md={3} lg={true} className="mb-2">
                  <div className="fw-bold text-secondary">
                    {width < 1320 ? "実働時間" : "実働時間(H)"}
                  </div>
                  <div className={`ps-3 fw-bold fs-4 ${styles.totalColor}`}>
                    {totalActiveTime.toFixed(2)}
                  </div>
                </Col>
                <Col xs={4} sm={3} md={3} lg={true} className="mb-2">
                  <div className="fw-bold text-secondary">
                    {width < 1320 ? "残業時間" : "残業時間(H)"}
                  </div>
                  <div className={`ps-3 fw-bold fs-4 ${styles.totalColor}`}>
                    {totalOverTime.toFixed(2)}
                  </div>
                </Col>
                <Col xs={4} sm={3} md={3} lg={true} className="mb-2">
                  <div className="fw-bold text-secondary">
                    {width < 1320 ? "深夜残業" : "深夜残業時間(H)"}
                  </div>
                  <div className={`ps-3 fw-bold fs-4 ${styles.totalColor}`}>
                    {totalLNOverTime.toFixed(2)}
                  </div>
                </Col>
                <Col xs={4} sm={3} md={3} lg={true} className="mb-2">
                  <div className="fw-bold text-secondary">
                    {width < 1320 ? "法定休日" : "法定休日勤務(H)"}
                  </div>
                  <div className={`ps-3 fw-bold fs-4 ${styles.totalColor}`}>
                    {totalLHActiveTime.toFixed(2)}
                  </div>
                </Col>
                <Col xs={4} sm={3} md={3} lg={true} className="mb-2">
                  <div className="fw-bold text-secondary">休暇日数</div>
                  <div className={`ps-3 fw-bold fs-4 ${styles.totalColor}`}>
                    {totalVacation}
                  </div>
                </Col>
                <Col xs={4} sm={3} md={3} lg={true} className="mb-2">
                  <div className="fw-bold text-secondary">遅刻回数</div>
                  <div className={`ps-3 fw-bold fs-4 ${styles.totalColor}`}>
                    {totalLate}
                  </div>
                </Col>
                <Col xs={4} sm={3} md={3} lg={true} className="mb-2">
                  <div className="fw-bold text-secondary">早退回数</div>
                  <div className={`ps-3 fw-bold fs-4 ${styles.totalColor}`}>
                    {totalLeaveEarly}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
