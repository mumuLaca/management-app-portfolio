/** ----- CRUD ----- */
type CodeCRUDKeys = "create" | "read" | "update" | "delete";
type TypeCodeCRUD = {
  [key in CodeCRUDKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 業務形態 ----- */
type AbsentDataKeys =
  | "none"
  | "allDayOff"
  | "halfDayOff"
  | "late"
  | "leaveEarly"
  | "compeDayOff"
  | "specialHoliday"
  | "companyEvent";

type TypeAbsentData = {
  [key in AbsentDataKeys]: {
    code: string;
    caption: string;
    allday: boolean;
  };
};

/** ----- 管理者権限 ----- */
type AdminRightsKeys = "general" | "admin" | "leader";

type TypeAdminRights = {
  [key in AdminRightsKeys]: { code: string; caption: string };
};

/** ----- 業務形態 ----- */
type WorkStyleKeys = "none" | "office" | "telework";

type TypeWorkStyle = {
  [key in WorkStyleKeys]: {
    code: string;
    mean: string;
  };
};

/** ----- 承認状況_勤務表 ----- */
type ApprovalStatusDRKeys =
  | "unapproved"
  | "input"
  | "approvalPending"
  | "reinput"
  | "reApprovalPending"
  | "approved";

type TypeApprovalStatusDR = {
  [key in ApprovalStatusDRKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 承認状況_交通費精算表 ----- */
type ApprovalStatusStlKeys =
  | "noInput"
  | "input"
  | "approvalPending"
  | "reinput"
  | "reApprovalPending"
  | "approved";

type TypeApprovalStatusStl = {
  [key in ApprovalStatusStlKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 承認状況_立替精算表 ----- */
type ApprovalStatusReimKeys =
  | "noInput"
  | "input"
  | "approvalPending"
  | "reinput"
  | "reApprovalPending"
  | "approved";

type TypeApprovalStatusReim = {
  [key in ApprovalStatusReimKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 承認状況_日報 ----- */
type ApprovalStatusDailyReportKeys =
  | "noInput"
  | "saveTemporary"
  | "submitted"
  | "firstApproval"
  | "secondApproval"
  | "firstPending"
  | "secondPending";

type TypeApprovalStatusDailyReport = {
  [key in ApprovalStatusDailyReportKeys]: {
    code: string;
    caption: string;
    next: string;
  };
};

/** ----- 精算形態 ----- */
type SettlementFormKeys = "commuter" | "trip";

type TypeSettlementForm = {
  [key in SettlementFormKeys]: {
    code: string;
    method: string;
  };
};

/** ----- 移動/宿泊 ----- */
type TravelMethodKeys = "none" | "oneWay" | "roundTrip" | "stay";

type TypeTravelMethod = {
  [key in TravelMethodKeys]: {
    code: string;
    method: string;
  };
};

/** ----- 表パターン ----- */
type ReportPatternKeys = "attendance" | "settlement" | "reimbursement";

type TypeReportPattern = {
  [key in ReportPatternKeys]: {
    code: string;
    name: string;
    ename: string;
  };
};

/** ----- 日報タイプ ----- */
type DailyReportTypeKeys = "daily" | "weekly" | "monthly" | "quarter";

type TypeDailyReportType = {
  [key in DailyReportTypeKeys]: {
    code: string;
    name: string;
  };
};

/** ----- 日報権限 ----- */
type DailyReportAuthorityKeys = "mySelf" | "trainer" | "officeStaff";

type TypeDailyReportAuthority = {
  [key in DailyReportAuthorityKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 日報権限 ----- */
type IssueStatusKeys = "inComplete" | "onGoing" | "complete" | "cancel";

type TypeIssueStatus = {
  [key in IssueStatusKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 変更フラグ ----- */
type TypeEntryFlg = {
  entry: string;
  update: string;
  delete: string;
};

/** ----- 勤務表‗集計項目 ----- */
interface TotalingItems {
  active: number;
  overTime: number;
  lNOverTime: number;
  legalHolActive: number;
  vacation: number;
  late: number;
  leavingEarly: number;
}

/** メッセージリスト */
interface MessageList {
  [key: string]: {
    kind: string;
    message: string;
  };
}

/** メッセージ */
interface Message {
  kind: string;
  message: string;
}

/** モーダル表示用メッセージリスト */
interface ModalMessageList {
  [key: string]: {
    kind: string;
    title: string;
    message: string;
    closeBtnPresence: boolean;
    btn1: {
      dispOn: boolean;
      words: string;
    };
    btn2: {
      dispOn: boolean;
      words: string;
    };
  };
}

/** モーダル表示用メッセージ */
interface ModalMessage {
  kind: string;
  title: string;
  message: string;
  closeBtnPresence: boolean;
  btn1: {
    dispOn: boolean;
    words: string;
  };
  btn2: {
    dispOn: boolean;
    words: string;
  };
}

/** モーダルメッセージレイアウト */
interface ModalMessageKindColor {
  [key: string]: {
    icon: string;
    backgroundColor: string;
    btnColor: string;
  };
}
