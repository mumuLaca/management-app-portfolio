import type { MessageList } from "@/types/types";

export const MESSAGE: MessageList = {
  IM0001: {
    kind: "info",
    message:
      "当月の勤務表は管理本部承認済です。訂正が必要な場合は管理本部へご連絡ください。",
  },
  IM0002: {
    kind: "info",
    message:
      "当月の交通費精算表は管理本部承認済です。訂正が必要な場合は管理本部へご連絡ください。",
  },
  SM0001: {
    kind: "success",
    message: "交通費精算の登録が完了しました。",
  },
  SM0002: {
    kind: "success",
    message: "ルーム作成が完了しました。ページを更新します。",
  },
  SM0003: {
    kind: "success",
    message: "ルーム更新が完了しました。ページを更新します。",
  },
  SM0004: {
    kind: "success",
    message: "ルーム削除が完了しました。ページを更新します。",
  },
  WM0001: {
    kind: "warning",
    message:
      "管理本部により差戻しが行われました。不備内容を修正し、再提出してください。",
  },
  EM00000: {
    kind: "danger",
    message:
      "サーバー処理中にエラーが発生しました。再度お試しいただくか、管理本部にお問い合わせください。",
  },
  EM00001: {
    kind: "danger",
    message: "対象月で入力が不正な日付が存在します。",
  },
  EM00002: {
    kind: "danger",
    message: "対象月で未入力の営業日が存在します。",
  },
  EM00003: {
    kind: "danger",
    message: "休暇日に不正な値が登録される為、登録できません。",
  },
  EM00004: {
    kind: "danger",
    message: "入力情報が不正です。",
  },
  EM00005: {
    kind: "danger",
    message: "ルーム作成に失敗しました。",
  },
};
