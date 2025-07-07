import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ‗プロフィール
 */
export default function PageProfile() {
  return (
    <>
      <h3 className={styles.cmnPageTitle}>プロフィール</h3>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>参照</h5>
          <span>基本情報を参照できます。</span>
        </li>
        <li>
          <h5>編集</h5>
          <span>基本情報の編集を行えます。</span>
          <br />
          <span>
            編集後の情報は勤務表等各種画面に反映されます。
            <br />
            ※一部編集不可項目があります。
          </span>
        </li>
      </ul>
    </>
  );
}
