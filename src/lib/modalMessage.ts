// btn2はキャンセルボタンとして定義
// ボタンは2つとしているが拡張は今後次第(これ以上の拡張は特別にモーダル作らせた方が良い気もする)
import type { ModalMessageList, ModalMessageKindColor } from "@/types/types";

export const MODALMESSAGE: ModalMessageList = {
  MM00001: {
    kind: "P",
    title: "管理本部へ提出",
    message: `<p className="fs-5">管理本部へ提出します。<br/>内容は間違いありませんか？</p><p>※管理本部の承認後に訂正が必要な場合は、管理本部にお問い合わせください。</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "提出",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
  MM00002: {
    kind: "W",
    title: "管理本部へ再提出",
    message: `<p className="fs-5">管理本部へ再提出します。<br/>内容は間違いありませんか？</p><p>※再提出後は修正が出来ません。</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "再提出",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
  MM00101: {
    kind: "W",
    title: "勤務表入力中",
    message: `<p className="fs-5">該当メンバーの勤務表はまだ提出されていません。<br/>承認してもよろしいですか？</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "承認",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
  MM00401: {
    kind: "S",
    title: "メンバー情報の更新",
    message: `<p className="fs-5">入力された内容でメンバー情報を更新します。<br/>よろしいですか？</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "更新",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
  MM00501: {
    kind: "S",
    title: "育成担当へ提出",
    message: `<p className="fs-5">育成担当へ提出します。<br/>内容は間違いありませんか？</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "提出",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
  MM00502: {
    kind: "S",
    title: "本社へ提出",
    message: `<p className="fs-5">本社担当へ提出します。<br/>内容は間違いありませんか？</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "提出",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
  MM00503: {
    kind: "S",
    title: "承認",
    message: `<p className="fs-5">承認処理を行います。<br/>内容は間違いありませんか？</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "承認",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
  MM00504: {
    kind: "W",
    title: "差戻し",
    message: `<p className="fs-5">差戻しを行います。<br/>指摘内容に間違いはありませんか？</p>`,
    closeBtnPresence: true,
    btn1: {
      dispOn: true,
      words: "差戻し",
    },
    btn2: {
      dispOn: true,
      words: "キャンセル",
    },
  },
};

// kindに対応するレイアウト変更（アイコン、タイトルの背景色、ボタン色(キャンセルは灰色固定の為無し)）
export const MODALMESSAGEKINDCOLOR: ModalMessageKindColor = {
  P: {
    icon: "bi bi-exclamation-circle-fill",
    backgroundColor: "bg-primary",
    btnColor: "primary",
  },
  D: {
    icon: "bi bi-x-octagon-fill",
    backgroundColor: "bg-danger",
    btnColor: "danger",
  },
  W: {
    icon: "bi bi-exclamation-triangle-fill",
    backgroundColor: "bg-warning",
    btnColor: "warning",
  },
  S: {
    icon: "bi bi-check-circle-fill",
    backgroundColor: "bg-success",
    btnColor: "success",
  },
  B: {
    icon: "bi bi-exclamation-circle-fill",
    backgroundColor: "bg-dark",
    btnColor: "dark",
  },
};
