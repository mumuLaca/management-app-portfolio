import { Reimbursement } from "@prisma/client";

/** 月別立替精算表データ型 */
export interface TypeMonthlyReimbursement {
  yearMonth: string;
  approvalStatus: string;
  list: Reimbursement[];
}
