import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ‗勤務表2
 */
export default function PageAttendance2() {
  return (
    <>
      <ul className={styles.CUlStyle}>
        <li style={{ borderBottom: "none" }}>
          <h5>記入ルール</h5>
          <span>
            社内行事(帰社・研修・健康診断・メンバー旅行など)に要した時間は就業扱いになりますが、勤務表上は実働時間に含めないでください。
            <br />
            →お客様先での実働時間(自社作業を除いた時間)と合わせる。
          </span>
          <br />
          <span style={{ color: "blue" }}>
            例）新卒会、全体会議のため午後帰社した場合、9:00～12:00
            とする。※9:00～18:00としない。
          </span>
          <br />
          <span>
            備考欄へ業務内容は記載不要です。(備考欄は代休取得時の対象日や帰社等の行事内容、遅刻理由等を記載）
          </span>
          <br />
          <span>
            休暇 or 遅刻 or 早退があった場合は区分欄に該当する休暇 or 遅刻 or
            早退を選択ください。
          </span>
          <br />
          <span style={{ color: "red" }}>
            ※電車遅延など正当な遅刻の場合は区分欄は記入不要で備考欄のみ理由(電車遅延等)を記載ください。
          </span>
          <br />
          <span>
            時差出勤の場合は区分欄は記入不要で備考欄のみ時差出勤またはシフト勤務などを記載ください。
          </span>
          <br />
          <span>
            特別休暇については共有フォルダ内の「05_【勤務規程】.pdf」を参照ください。
          </span>
        </li>
      </ul>
    </>
  );
}
