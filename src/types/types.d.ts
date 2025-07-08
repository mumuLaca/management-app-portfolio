/** ----- CRUD ----- */
export type CodeCRUDKeys = "create" | "read" | "update" | "delete";
export type TypeCodeCRUD = {
  [key in CodeCRUDKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 業務形態 ----- */
export type AbsentDataKeys =
  | "none"
  | "allDayOff"
  | "halfDayOff"
  | "late"
  | "leaveEarly"
  | "compeDayOff"
  | "specialHoliday"
  | "companyEvent";

export type TypeAbsentData = {
  [key in AbsentDataKeys]: {
    code: string;
    caption: string;
    allday: boolean;
  };
};

/** ----- 管理者権限 ----- */
export type AdminRightsKeys = "general" | "admin" | "leader";

export type TypeAdminRights = {
  [key in AdminRightsKeys]: { code: string; caption: string };
};

/** ----- 業務形態 ----- */
export type WorkStyleKeys = "none" | "office" | "telework";

export type TypeWorkStyle = {
  [key in WorkStyleKeys]: {
    code: string;
    mean: string;
  };
};

/** ----- 承認状況_勤務表 ----- */
export type ApprovalStatusDRKeys =
  | "unapproved"
  | "input"
  | "approvalPending"
  | "reinput"
  | "reApprovalPending"
  | "approved";

export type TypeApprovalStatusDR = {
  [key in ApprovalStatusDRKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 承認状況_交通費精算表 ----- */
export type ApprovalStatusStlKeys =
  | "noInput"
  | "input"
  | "approvalPending"
  | "reinput"
  | "reApprovalPending"
  | "approved";

export type TypeApprovalStatusStl = {
  [key in ApprovalStatusStlKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 承認状況_立替精算表 ----- */
export type ApprovalStatusReimKeys =
  | "noInput"
  | "input"
  | "approvalPending"
  | "reinput"
  | "reApprovalPending"
  | "approved";

export type TypeApprovalStatusReim = {
  [key in ApprovalStatusReimKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 承認状況_日報 ----- */
export type ApprovalStatusDailyReportKeys =
  | "noInput"
  | "saveTemporary"
  | "submitted"
  | "firstApproval"
  | "secondApproval"
  | "firstPending"
  | "secondPending";

export type TypeApprovalStatusDailyReport = {
  [key in ApprovalStatusDailyReportKeys]: {
    code: string;
    caption: string;
    next: string;
  };
};

/** ----- 精算形態 ----- */
export type SettlementFormKeys = "commuter" | "trip";

export type TypeSettlementForm = {
  [key in SettlementFormKeys]: {
    code: string;
    method: string;
  };
};

/** ----- 移動/宿泊 ----- */
export type TravelMethodKeys = "none" | "oneWay" | "roundTrip" | "stay";

export type TypeTravelMethod = {
  [key in TravelMethodKeys]: {
    code: string;
    method: string;
  };
};

/** ----- 表パターン ----- */
export type ReportPatternKeys = "attendance" | "settlement" | "reimbursement";

export type TypeReportPattern = {
  [key in ReportPatternKeys]: {
    code: string;
    name: string;
    ename: string;
  };
};

/** ----- 日報タイプ ----- */
export type DailyReportTypeKeys = "daily" | "weekly" | "monthly" | "quarter";

export type TypeDailyReportType = {
  [key in DailyReportTypeKeys]: {
    code: string;
    name: string;
  };
};

/** ----- 日報権限 ----- */
export type DailyReportAuthorityKeys = "mySelf" | "trainer" | "officeStaff";

export type TypeDailyReportAuthority = {
  [key in DailyReportAuthorityKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 日報権限 ----- */
export type IssueStatusKeys = "inComplete" | "onGoing" | "complete" | "cancel";

export type TypeIssueStatus = {
  [key in IssueStatusKeys]: {
    code: string;
    caption: string;
  };
};

/** ----- 変更フラグ ----- */
export type TypeEntryFlg = {
  entry: string;
  update: string;
  delete: string;
};

/** ----- 勤務表‗集計項目 ----- */
export interface TotalingItems {
  active: number;
  overTime: number;
  lNOverTime: number;
  legalHolActive: number;
  vacation: number;
  late: number;
  leavingEarly: number;
}

/** メッセージリスト */
export interface MessageList {
  [key: string]: {
    kind: string;
    message: string;
  };
}

/** メッセージ */
export interface Message {
  kind: string;
  message: string;
}

/** モーダル表示用メッセージリスト */
export interface ModalMessageList {
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
export interface ModalMessage {
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
export interface ModalMessageKindColor {
  [key: string]: {
    icon: string;
    backgroundColor: string;
    btnColor: string;
  };
}

/** 日報共通URLパラメータ */
export interface DailyReportCommonUrlParams {
  roomId: string;
  dailyReportType: string;
  fromDate: string;
  toDate: string;
}
