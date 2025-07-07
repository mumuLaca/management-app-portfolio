import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ‗提出状況2
 */
export default function PageStatus2() {
  return (
    <>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>承認</h5>
          <span>
            メンバーが勤務表を提出した場合、管理本部への通知は行われません。
          </span>
          <br />
          <span>
            勤務表の提出を承認した場合、対象メンバーは該当月の勤務表が編集不可になります。
          </span>
        </li>
        <li>
          <h5>差戻し</h5>
          <span>差戻し時、対象メンバーにSlackでの通知を行います。</span>
          <br />
          <span>通知はBotにより行われます。 （操作者ではありません。）</span>
          <br />
          <span>
            差戻し後、対象メンバーが修正し再度提出を行うと、Slackチャンネル「勤務表アプリ窓口」に通知が行われます。
            <br />
            再提出後に再度承認が可能となります。
          </span>
        </li>
      </ul>
    </>
  );
}
