/**
 * @description
 * 定数クラス
 */
import { Employee } from "@prisma/client";
import type {
  TypeCodeCRUD,
  TypeAbsentData,
  TypeAdminRights,
  TypeWorkStyle,
  TypeApprovalStatusDR,
  TypeApprovalStatusStl,
  TypeApprovalStatusReim,
  TypeApprovalStatusDailyReport,
  TypeSettlementForm,
  TypeTravelMethod,
  TypeEntryFlg,
  TypeReportPattern,
  TypeDailyReportType,
  TypeDailyReportAuthority,
  TypeIssueStatus,
} from "@/types/types";

export const CodeCRUD: TypeCodeCRUD = {
  create: { code: "1", caption: "登録" },
  read: { code: "2", caption: "参照" },
  update: { code: "3", caption: "更新" },
  delete: { code: "4", caption: "削除" },
};

/** メタデータ */
export const SiteMeta = {
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
  },
};

/** 固定休日（形式：MM-DD） */
export const FixedHoliday: string[] = [
  "01-01",
  "01-02",
  "01-03",
  "01-04",
  "12-30",
  "12-31",
];

/** 区分 */
export const AbsentData: TypeAbsentData = {
  none: { code: "000", caption: "", allday: false },
  allDayOff: { code: "100", caption: "有給休暇（全）", allday: true },
  halfDayOff: { code: "200", caption: "有給休暇（半）", allday: false },
  late: { code: "300", caption: "遅刻", allday: false },
  leaveEarly: { code: "400", caption: "早退", allday: false },
  compeDayOff: { code: "500", caption: "代休", allday: true },
  specialHoliday: { code: "600", caption: "特別休暇", allday: true },
  companyEvent: { code: "700", caption: "社内行事", allday: false },
};

/** 管理者権限 */
export const AdminRights: TypeAdminRights = {
  general: {
    code: "0",
    caption: "一般",
  },
  admin: {
    code: "1",
    caption: "管理者",
  },
  leader: {
    code: "2",
    caption: "拠点管理者",
  },
};

/** 勤務形態 */
export const WorkStyle: TypeWorkStyle = {
  none: {
    code: "0",
    mean: "",
  },
  office: {
    code: "1",
    mean: "出社",
  },
  telework: {
    code: "2",
    mean: "在宅勤務",
  },
};

/** 承認状況_勤務表 */
export const ApprovalStatusAttendance: TypeApprovalStatusDR = {
  unapproved: { code: "0", caption: "未入力" },
  input: { code: "1", caption: "入力中" },
  approvalPending: { code: "2", caption: "承認待ち" },
  reinput: { code: "3", caption: "差戻中" },
  reApprovalPending: { code: "4", caption: "再申請中" },
  approved: { code: "5", caption: "承認済" },
};

/** 承認状況‗交通費精算表 */
export const ApprovalStatusSettlement: TypeApprovalStatusStl = {
  noInput: { code: "0", caption: "申請なし" }, // 未入力
  input: { code: "1", caption: "入力中" }, // 入力中、未提出
  approvalPending: { code: "2", caption: "承認待ち" }, // 入力、提出済
  reinput: { code: "3", caption: "差戻中" }, // 入力ミスにより差戻、再修正中
  reApprovalPending: { code: "4", caption: "再申請中" }, // 差戻後、再提出
  approved: { code: "5", caption: "承認済" }, // 管理本部の承認済
};

/** 承認状況‗立替精算表 */
export const ApprovalStatusReimbursement: TypeApprovalStatusReim = {
  noInput: { code: "0", caption: "申請なし" }, // 未入力
  input: { code: "1", caption: "入力中" }, // 入力中、未提出
  approvalPending: { code: "2", caption: "承認待ち" }, // 入力、提出済
  reinput: { code: "3", caption: "差戻中" }, // 入力ミスにより差戻、再修正中
  reApprovalPending: { code: "4", caption: "再申請中" }, // 差戻後、再提出
  approved: { code: "5", caption: "承認済" }, // 管理本部の承認済
};

/** 承認状況‗日報 */
export const ApprovalStatusDailyReport: TypeApprovalStatusDailyReport = {
  noInput: { code: "0", caption: "未入力", next: "" }, // 未入力
  saveTemporary: { code: "1", caption: "一時保存中", next: "" }, // 一時保存
  submitted: { code: "2", caption: "提出済", next: "育成担当承認待ち" }, // 提出済
  firstApproval: { code: "3", caption: "育成担当承認済", next: "本社承認待ち" },
  secondApproval: { code: "4", caption: "本社承認済", next: "" },
  firstPending: { code: "5", caption: "一次差戻中", next: "育成担当承認済" },
  secondPending: { code: "6", caption: "二次差戻中", next: "本社承認済" },
};

/** 精算形態 */
export const SettlementForm: TypeSettlementForm = {
  commuter: { code: "0", method: "通勤" },
  trip: { code: "1", method: "出張" },
};

/** 移動/宿泊 */
export const TravelMethod: TypeTravelMethod = {
  none: { code: "0", method: "" },
  oneWay: { code: "1", method: "移動（片道）" },
  roundTrip: { code: "2", method: "移動（往復）" },
  stay: { code: "3", method: "宿泊" },
};

/** 変更フラグ */
export const EntryFlg: TypeEntryFlg = {
  entry: "1",
  update: "2",
  delete: "3",
};

/** 表パターン */
export const ReportPattern: TypeReportPattern = {
  attendance: {
    code: "1",
    name: "勤務表",
    ename: "attendance",
  },
  settlement: {
    code: "2",
    name: "交通費精算表",
    ename: "settlement",
  },
  reimbursement: {
    code: "3",
    name: "立替精算表",
    ename: "reimbursement",
  },
};

/** 日報タイプ */
export const DailyReportType: TypeDailyReportType = {
  daily: {
    code: "1",
    name: "日報",
  },
  weekly: {
    code: "2",
    name: "週報",
  },
  monthly: {
    code: "3",
    name: "月報",
  },
  quarter: {
    code: "4",
    name: "四半期",
  },
};

/** 日報権限 */
export const DailyReportAuthority: TypeDailyReportAuthority = {
  mySelf: {
    code: "0",
    caption: "自分",
  },
  trainer: {
    code: "1",
    caption: "育成担当",
  },
  officeStaff: {
    code: "2",
    caption: "本社担当",
  },
};

/** メンバー情報初期値 */
export const InitEmployeeInfo: Employee = {
  id: 0,
  email: "",
  name: "",
  section: "",
  admin: AdminRights.general.code,
  startTime: "09:00",
  endTime: "18:00",
  basicWorkStyle: WorkStyle.none.code,
  dailyReportAuthority: "0",
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** 課題進行状況 */
export const IssueStatus: TypeIssueStatus = {
  inComplete: { code: "0", caption: "未完了" },
  onGoing: { code: "1", caption: "進行中" },
  complete: { code: "2", caption: "完了" },
  cancel: { code: "3", caption: "キャンセル" },
};
