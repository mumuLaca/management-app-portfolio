import { Attendance } from "@prisma/client";
import dayjs from "@/lib/dayjs";
import { isHoliday } from "@holiday-jp/holiday_jp";
import { AbsentData, FixedHoliday, WorkStyle } from "@/lib/constants";
import { getAbsentDataKey } from "./constantsUtil";

/**
 * @description
 * 勤務表の入力チェック
 *
 * @param row Attendanceレコード
 * @returns エラーコード
 */
export function checkAttendanceInput(row: Attendance | undefined): string {
  // Attendanceがundefined
  if (!row) return "";

  // 専用チェック【半休、社内行事】
  if (
    AbsentData[getAbsentDataKey(row.absentCode)].code ===
      AbsentData.companyEvent.code ||
    AbsentData[getAbsentDataKey(row.absentCode)].code ===
      AbsentData.halfDayOff.code
  ) {
    // 入力値が正常の場合処理を終了
    if (
      (!row.startTime &&
        !row.endTime &&
        !row.rest &&
        row.workStyle === WorkStyle.none.code) ||
      (row.startTime && row.endTime && row.workStyle !== WorkStyle.none.code)
    ) {
      return "";
    } else {
      return "EM00001";
    }
  }

  // 全休扱いの日に不要なデータが入力されている場合エラー
  if (AbsentData[getAbsentDataKey(row.absentCode)].allday) {
    if (
      row.startTime ||
      row.endTime ||
      row.rest ||
      row.workStyle !== WorkStyle.none.code
    ) {
      return "EM00001";
    }
  }

  // 勤務開始 or 終了時間 or 勤務形態のいずれかが未入力の場合エラー
  if (
    ((!row.endTime || row.workStyle === WorkStyle.none.code) &&
      row.startTime) ||
    ((!row.startTime || row.workStyle === WorkStyle.none.code) &&
      row.endTime) ||
    ((!row.startTime || !row.endTime) && row.workStyle !== WorkStyle.none.code)
  ) {
    return "EM00001";

    // レコードが存在しているが値が入力されていない
  } else if (
    !row.startTime &&
    !row.endTime &&
    !row.rest &&
    row.workStyle === WorkStyle.none.code
  ) {
    // 区分が全休扱いでない場合はエラー
    if (!AbsentData[getAbsentDataKey(row.absentCode)].allday) {
      return "EM00001";
    }

    // 勤務開始~終了時間、勤務形態が未入力の場合
  } else if (
    !row.startTime &&
    !row.endTime &&
    row.workStyle === WorkStyle.none.code
  ) {
    // 休憩時間のみ入力されている場合エラー
    if (row.rest) {
      return "EM00001";
    }
  }

  return "";
}

/**
 * @description
 * 営業日空白チェック
 *
 * @param targetMonth 対象月
 * @param row Attendanceレコード
 * @returns エラーコード
 */
export function checkAttendanceBrank(
  targetMonth: string,
  attendance: Attendance[]
): string {
  if (!attendance) return "EM00002";

  const currentMonth = dayjs(`${targetMonth}01`, "YYYYMMDD");
  const nextMonth = currentMonth.add(1, "month");

  // 営業日に対して未入力が無いかチェック
  for (let date = currentMonth; date < nextMonth; date = date.add(1, "day")) {
    if (
      date.day() !== 0 &&
      date.day() !== 6 &&
      !isHoliday(date.toDate()) &&
      !FixedHoliday.includes(date.format("MM-DD"))
    ) {
      const today = attendance.find(
        (row: Attendance) =>
          row.date.getDate() === date.add(9, "h").toDate().getDate()
      );

      if (!today) return "EM00002";
    }
  }

  return "";
}
