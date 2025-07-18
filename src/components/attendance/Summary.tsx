"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/Attendance.module.css";
import { useWindowSize } from "@/lib/useWindowSize";
import { TypeMonthlyAttendance } from "@/types/attendance";
import { AbsentData } from "@/lib/constants";
import { BsArrowDownCircleFill } from "react-icons/bs";

/**
 * @description
 * 集計コンポーネント
 *
 * 勤務表の各種集計項目とその値を表示
 */
export default function Summary({
  attendanceData,
}: {
  attendanceData: TypeMonthlyAttendance; // 勤務表データ
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
      attendanceData.list.reduce((sum, row) => {
        return sum + Number(row?.activeTime ?? 0);
      }, 0),
    [attendanceData.list]
  );

  /** 残業時間算出 */
  const totalOverTime = useMemo(
    () =>
      attendanceData.list.reduce((sum, row) => sum + (row?.overTime ?? 0), 0),
    [attendanceData.list]
  );

  /** 深夜残業時間算出 */
  const totalLNOverTime = useMemo(
    () =>
      attendanceData.list.reduce(
        (sum, row) => sum + Number(row?.lNOverTime ?? 0),
        0
      ),
    [attendanceData.list]
  );

  /** 法定休日勤務時間算出 */
  const totalLHActiveTime = useMemo(
    () =>
      attendanceData.list.reduce(
        (sum, row) => sum + Number(row?.legalHolActive ?? 0),
        0
      ),
    [attendanceData.list]
  );

  /** 有給日数算数 */
  const totalVacation = useMemo(
    () =>
      attendanceData.list.reduce((count, row) => {
        if (row.absentCode === AbsentData.allDayOff.code) {
          count += 1;
        } else if (row.absentCode === AbsentData.halfDayOff.code) {
          count += 0.5;
        }
        return count;
      }, 0),
    [attendanceData.list]
  );

  /** 遅刻日数算出 */
  const totalLate = useMemo(
    () =>
      attendanceData.list.reduce((count, row) => {
        if (row.absentCode === AbsentData.late.code) {
          count += 1;
        }
        return count;
      }, 0),
    [attendanceData.list]
  );

  /** 相対日数算出 */
  const totalLeaveEarly = useMemo(
    () =>
      attendanceData.list.reduce((count, row) => {
        if (row.absentCode === AbsentData.leaveEarly.code) {
          count += 1;
        }
        return count;
      }, 0),
    [attendanceData.list]
  );

  return (
    <>
      <div className={`mb-3 ${width < 992 ? "w-full" : ""}`}>
        <div className={styles.accordion}>
          <div
            className={`${styles.contentBox} ${isActive ? styles.active : ""}`}
            onClick={() => setIsActive(!isActive)}
          >
            <BsArrowDownCircleFill className={styles.arrow} />
            <div className={styles.label}>集計</div>
            <div className={styles.content}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 gap-4 px-2">
                <div className="mb-2">
                  <div className="font-bold text-secondary">
                    {width < 1320 ? "実働時間" : "実働時間(H)"}
                  </div>
                  <div
                    className={`ps-3 font-bold text-2xl ${styles.totalColor}`}
                  >
                    {totalActiveTime.toFixed(2)}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-secondary">
                    {width < 1320 ? "残業時間" : "残業時間(H)"}
                  </div>
                  <div
                    className={`ps-3 font-bold text-2xl ${styles.totalColor}`}
                  >
                    {totalOverTime.toFixed(2)}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-secondary">
                    {width < 1320 ? "深夜残業" : "深夜残業時間(H)"}
                  </div>
                  <div
                    className={`ps-3 font-bold text-2xl ${styles.totalColor}`}
                  >
                    {totalLNOverTime.toFixed(2)}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-secondary">
                    {width < 1320 ? "法定休日" : "法定休日勤務(H)"}
                  </div>
                  <div
                    className={`ps-3 font-bold text-2xl ${styles.totalColor}`}
                  >
                    {totalLHActiveTime.toFixed(2)}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-secondary">休暇日数</div>
                  <div
                    className={`ps-3 font-bold text-2xl ${styles.totalColor}`}
                  >
                    {totalVacation}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-secondary">遅刻回数</div>
                  <div
                    className={`ps-3 font-bold text-2xl ${styles.totalColor}`}
                  >
                    {totalLate}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-secondary">早退回数</div>
                  <div
                    className={`ps-3 font-bold text-2xl ${styles.totalColor}`}
                  >
                    {totalLeaveEarly}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
