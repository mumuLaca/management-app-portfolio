import { DailyReport } from "@prisma/client";
import dayjs from "@/lib/dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * @description
 * 稼働時間(日)算出
 *
 * @param row DailyReportレコード
 * @returns 稼働時間
 */
export function calcActiveTime(row: DailyReport): number | null {
  if (row.startTime === null || row.endTime === null) {
    return null;
  }
  const rest = row.rest ? Number(row.rest) : 0;
  let active = null;

  const s = dayjs.utc(row.startTime);
  const e = dayjs.utc(row.endTime);

  // 日付をまたがって勤務した場合、
  // マイナス時間にならないよう24時間を加算してから計算する
  if (e <= s) {
    active = e.add(24, "hours").diff(s, "minutes") / 60 - rest;
  } else {
    active = e.diff(s, "minutes") / 60 - rest;
  }
  return active < 0 ? 0 : active;
}

/**
 * @description
 * 残業時間算出
 *
 * @param input DailyReport
 * @returns 残業時間
 */
export function calcOverTime(input: DailyReport): number | null {
  const activeTime = calcActiveTime(input);

  if (activeTime === null) return null;

  return activeTime >= 8 ? activeTime - 8 : null;
}

/**
 * @description
 * ===休憩時間は含めていない
 * 深夜残業時間算出
 *
 * @param row DailyReportレコード
 * @returns 深夜残業時間
 */
export function calcLateNightOverTime(input: DailyReport): number | null {
  if (input.startTime === null || input.endTime === null) {
    return null;
  }

  let lNActive = null;

  const startTime = dayjs.utc(input.startTime);
  const endTime = dayjs.utc(input.endTime);
  const am5 = dayjs.utc(input.endTime).set("hour", 5).set("minute", 0);
  const am0 = dayjs.utc(input.endTime).set("hour", 0).set("minute", 0);
  const pm22 = dayjs.utc(input.endTime).set("hour", 22).set("minute", 0);

  const s = startTime.hour();
  const e = endTime.hour();

  // ===簡略化したい
  // 入力時刻に制限を設けたうえでこの処理も整理したい
  if (s === e) {
    lNActive = am5.add(24, "hours").diff(pm22, "minutes") / 60;
  } else if (s < 22) {
    if (s < 5 && e < 5) {
      if (startTime > endTime) {
        lNActive =
          (am5.diff(startTime, "minutes") +
            endTime.add(24, "hours").diff(pm22, "minutes")) /
          60;
      } else {
        lNActive = endTime.diff(startTime, "minutes") / 60;
      }
    } else if (s < 5 && e >= 5) {
      if (e >= 22) {
        lNActive =
          (am5.diff(startTime, "minutes") + endTime.diff(pm22, "minutes")) / 60;
      } else {
        lNActive = am5.diff(startTime, "minutes") / 60;
      }
    } else if (s >= 5 && e < 5) {
      lNActive = endTime.add(24, "hours").diff(pm22, "minutes") / 60;
    } else if (s >= 5 && e >= 5) {
      if (e >= 22) {
        lNActive = endTime.subtract(22, "hours").diff(0, "minutes") / 60;
      } else {
        if (endTime < startTime) {
          lNActive = am5.add(24, "hours").diff(pm22, "minutes") / 60;
        }
      }
    }
  } else if (s >= 22) {
    if (endTime > startTime) {
      lNActive = endTime.diff(startTime, "minutes") / 60;
    } else {
      if (e >= 22) {
        lNActive =
          (endTime.diff(pm22, "minutes") +
            am5.add(24, "hours").diff(startTime, "minutes")) /
          60;
      } else if (0 <= e && e <= 5) {
        lNActive =
          (am0.add(24, "hours").diff(startTime, "minutes") +
            endTime.diff(am0, "minutes")) /
          60;
      } else {
        lNActive = am5.add(24, "hours").diff(startTime, "minutes") / 60;
      }
    }
  }

  return lNActive;
}

/**
 * @description
 * 法定休日勤務時間算出
 *
 * @param row DailyReportレコード
 * @returns 法定休日勤務時間
 */
export function calcLegalHolidayActiveTime(input: DailyReport): number | null {
  if (input === undefined) return null;

  const date = dayjs(input.date);
  const holiday = date.day() === 0;

  // 日曜日のみ稼働時間を計算
  if (!holiday) return null;

  const activeTime = calcActiveTime(input);

  return activeTime;
}
