import { Attendance } from "@prisma/client";

/** 勤務表レコード */
export interface TypeAttendanceItem {
  date: string;
  mday: string;
  wday: string;
  holiday: boolean;
  fixedHoliday: boolean;
  saturday: boolean;
  sunday: boolean;
  startTime: string;
  endTime: string;
  rest: string;
  absent: string;
  absentCode: string;
  workStyle: WorkStyleKeys;
  active: string;
  overTime: string;
  lNOverTime: string;
  legalHolActive: string;
  note: string;
  empty: boolean;
}

/** Attendance拡張型 */
export interface TypeCustomAttendance extends Attendance {
  key: string;
  activeTime: number | null;
  overTime: number | null;
  lNOverTime: number | null;
  legalHolActive: number | null;
}

/** 月別勤務表データ型 */
export interface TypeMonthlyAttendance {
  yearMonth: string;
  approvalStatus: string;
  list: TypeCustomAttendance[];
}
