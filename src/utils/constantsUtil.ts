import {
  AbsentData,
  AdminRights,
  ApprovalStatusAttendance,
  WorkStyle,
  TravelMethod,
  ApprovalStatusSettlement,
  ReportPattern,
  SettlementForm,
  ApprovalStatusReimbursement,
  CodeCRUD,
} from "@/lib/constants";

/** CRUDのcodeに対応するkeyを返却 */
export const getCodeCRUDKey = (codeFind: string): CodeCRUDKeys => {
  const entry = Object.entries(CodeCRUD).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as CodeCRUDKeys)
    : (Object.keys(CodeCRUD)[0] as CodeCRUDKeys);
};

/** 管理者権限のcodeに対応するbooleanを返却 */
export const adminRightsKey = (codeFind: string): AdminRightsKeys => {
  const entry = Object.entries(AdminRights).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as AdminRightsKeys)
    : (Object.keys(AdminRights)[0] as AdminRightsKeys);
};

/** 勤務形態のcodeに対応するkeyを返却 */
export const getWorkStyleKey = (codeFind: string): WorkStyleKeys => {
  const entry = Object.entries(WorkStyle).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as WorkStyleKeys)
    : (Object.keys(WorkStyle)[0] as WorkStyleKeys);
};

/** 区分のcodeに対応するkeyを返却 */
export const getAbsentDataKey = (codeFind: string): AbsentDataKeys => {
  const entry = Object.entries(AbsentData).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as AbsentDataKeys)
    : (Object.keys(AbsentData)[0] as AbsentDataKeys);
};

/** 勤務表_承認状況のcodeに対応するkeyを返却 */
export const getApprovalAttendanceKey = (
  codeFind: string
): ApprovalStatusDRKeys => {
  const entry = Object.entries(ApprovalStatusAttendance).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as ApprovalStatusDRKeys)
    : (Object.keys(ApprovalStatusAttendance)[0] as ApprovalStatusDRKeys);
};

/** 交通費精算表_承認状況のcodeに対応するkeyを返却 */
export const getApprovalSettlementKey = (
  codeFind: string
): ApprovalStatusStlKeys => {
  const entry = Object.entries(ApprovalStatusSettlement).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as ApprovalStatusStlKeys)
    : (Object.keys(ApprovalStatusSettlement)[0] as ApprovalStatusStlKeys);
};

/** 立替精算表_承認状況のcodeに対応するkeyを返却 */
export const getApprovalReimbursementKey = (
  codeFind: string
): ApprovalStatusReimKeys => {
  const entry = Object.entries(ApprovalStatusReimbursement).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as ApprovalStatusReimKeys)
    : (Object.keys(ApprovalStatusReimbursement)[0] as ApprovalStatusReimKeys);
};

/** 精算形態のcodeに対応するkeyを返却 */
export const getSettlementFormKey = (codeFind: string): SettlementFormKeys => {
  const entry = Object.entries(SettlementForm).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as SettlementFormKeys)
    : (Object.keys(SettlementForm)[0] as SettlementFormKeys);
};

/** 移動/宿泊のcodeに対応するkeyを返却 */
export const getTravelMethodKey = (codeFind: string): TravelMethodKeys => {
  const entry = Object.entries(TravelMethod).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as TravelMethodKeys)
    : (Object.keys(TravelMethod)[0] as TravelMethodKeys);
};

/** 表パターンのcodeに対応するkeyを返却 */
export const getReportPatternKey = (codeFind: string): ReportPatternKeys => {
  const entry = Object.entries(ReportPattern).find(
    ([, value]) => value.code === codeFind
  );
  return entry
    ? (entry[0] as ReportPatternKeys)
    : (Object.keys(ReportPattern)[0] as ReportPatternKeys);
};
