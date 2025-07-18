import { Settlement } from "@prisma/client";

/** 月別交通費精算表データ型 */
export interface TypeMonthlySettlement {
  yearMonth: string;
  approvalStatus: string;
  list: Settlement[];
}
