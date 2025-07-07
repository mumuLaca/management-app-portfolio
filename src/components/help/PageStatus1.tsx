import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ‗提出状況1
 */
export default function PageStatus1() {
  return (
    <>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>CSVダウンロード</h5>
          <span>
            プルダウンに表示中の年月がCSV出力対象となります。
            （最大6ヵ月前まで参照可能）
          </span>
          <br />
          <span> ステータスが「承認」のメンバーのみ出力されます。</span>
          <br />
          <span> フィルタリング後は表示中のメンバーが出力対象となります。</span>
          <br />
          （ステータス「承認」のみ）
        </li>
        <li>
          <h5>勤務表の閲覧</h5>
          <span>表示中の年月の勤務表を参照出来ます。</span>
          <br />
          <span>入力中、承認済等ステータスを問いません。</span>
        </li>
        <li>
          <h5>ステータスの遷移</h5>
          <span>
            管理者の操作によりステータスの変更を行うことができます。
            ドロップダウンボタンより操作を行ってください。
            <br /> ・&nbsp;&nbsp;未入力→変更不可
            <br /> ・&nbsp;&nbsp;入力中→承認 ※メンバー入力中だが強制的に承認可能
            <br /> ・&nbsp;&nbsp;承認可→承認 or 差戻し
            <br /> ・&nbsp;&nbsp;再入力中→変更不可
            <br /> ・&nbsp;&nbsp;承認済→差戻し ※誤承認による差戻しが可能
          </span>
        </li>
      </ul>
    </>
  );
}
