import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ‗メンバー登録
 */
export default function PageAddUser() {
  return (
    <>
      <h3 className={styles.cmnPageTitle}>メンバー登録</h3>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>メンバー情報の追加</h5>
          <span>
            以下項目はプロフィールにて各自で変更が可能です。
            <br />
            ・&nbsp;&nbsp;業務開始時間
            <br />
            ・&nbsp;&nbsp;業務終了時間
            <br />
            ・&nbsp;&nbsp;勤務形態（出社 or 在宅勤務）
          </span>
        </li>
        <li>
          <h5>誤登録</h5>
          <span>
            登録後の修正は「メンバー削除」、「メンバー変更」にて実施してください。
          </span>
        </li>
      </ul>
    </>
  );
}
