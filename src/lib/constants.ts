/**
 * @description
 * 定数クラス
 */
import { Employee } from "@prisma/client";

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
export const ApprovalStatusDailyReport: TypeApprovalStatusDR = {
  unapproved: { code: "0", caption: "未入力" },
  input: { code: "1", caption: "入力中" },
  approvalPending: { code: "2", caption: "承認待ち" },
  reinput: { code: "3", caption: "差戻中" },
  reApprovalPending: { code: "4", caption: "再申請中" },
  approved: { code: "5", caption: "承認済" },
};

/** 承認状況‗旅費精算表 */
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
  dailyReport: {
    code: "1",
    name: "勤務表",
    ename: "dailyReport",
  },
  settlement: {
    code: "2",
    name: "旅費精算表",
    ename: "settlement",
  },
  reimbursement: {
    code: "3",
    name: "立替精算表",
    ename: "reimbursement",
  },
};

/** 社員情報初期値 */
export const InitEmployeeInfo: Employee = {
  id: 0,
  email: "",
  name: "",
  section: "",
  admin: AdminRights.general.code,
  startTime: "09:00",
  endTime: "18:00",
  basicWorkStyle: WorkStyle.none.code,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** 【テスト】先行テストID */
export const TestIDList = [343100, 344084, 345083, 362119];
