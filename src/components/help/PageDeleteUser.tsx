import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ_ユーザー削除
 */
export default function PageDeleteUser() {
  return (
    <>
      <h3 className={styles.cmnPageTitle}>ユーザー削除</h3>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>削除単位</h5>
          <span>一括削除は出来ません。</span>
        </li>
        <li>
          <h5>フィルタリング</h5>
          <span>氏名によるフィルタリングが可能です。</span>
        </li>
      </ul>
    </>
  );
}
