import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ‗旅費精算表
 */
export default function PageSettlement() {
  return (
    <>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>入力月</h5>
          <span>当月、及び前月の入力が可能です。</span>
        </li>
        <li>
          <h5>登録・修正・削除</h5>
          <span>登録ボタンを押下するとダイアログが表示されます。</span>
          <br />
          <span>該当日付の精算内容を入力し、登録してください。</span>
          <br />
          <span>日付カレンダーでは複数日付の選択が可能です。</span>
          <br />
          <span>各日付の修正ボタンからデータ修正、削除が出来ます。</span>
        </li>
        <li>
          <h5>同日の精算順序</h5>
          <span>同日に複数登録がある場合、矢印が表示されます。</span>
          <br />
          <span>クリックすると精算順序が変更されます。</span>
        </li>
        <li>
          <h5>ステータス</h5>
          <span>「管理本部へ提出」を実行すると提出が完了します。 </span>
          <br />
          <span>
            管理本部が承認するまで再入力可能です。
            ステータスボタン「入力訂正」を実行してください。
          </span>
          <br />
          <span>管理本部の承認による通知はありません。</span>
        </li>
        <li>
          <h5>差戻し</h5>
          <span>差戻しが行われるとslackに通知が届きます。 </span>
          <br />
          <span>指摘事項を修正し、再度提出してください。</span>
          <br />
          <span>再提出後は修正が出来ません。</span>
        </li>
      </ul>
    </>
  );
}
