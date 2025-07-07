import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ‗勤務表1
 */
export default function PageDailyReport1() {
  return (
    <>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>入力月</h5>
          <span>当月、及び前月の入力が可能です。</span>
        </li>
        <li>
          <h5>登録</h5>
          <span>日付ボタンを押下するとダイアログが表示されます。</span>
          <br />
          <span>当日の勤務内容を入力し、登録を行ってください。</span>
          <br />
          <span>日付カレンダーでは複数日付の選択が可能です。</span>
        </li>
        <li>
          <h5>一括登録</h5>
          <span>土日祝日を除く営業日に対して一括入力が可能です。</span>
          <br />
          <span>入力済の日付は上書きされません。</span>
          <br />
          <span>
            勤務時間、勤務形態の初期値はプロフィールの同項目と同期しています。プロフィールを編集することで初期値を変更できます。
          </span>
          <br />
          <span>入力済の日付に対して一括修正を行う事も可能です。</span>
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
