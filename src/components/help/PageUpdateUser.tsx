import React from "react";
import styles from "@/styles/Help.module.css";

/**
 * @description
 * ヘルプページ_メンバー更新
 */
export default function PageUpdateUser() {
  return (
    <>
      <h3 className={styles.cmnPageTitle}>メンバー更新</h3>
      <ul className={styles.CUlStyle}>
        <li>
          <h5>更新方法</h5>
          <span>複数メンバー情報の一括変更が可能です。</span>
          <br />
          <span>変更点はカラーリングされる。</span>
        </li>
        <li>
          <h5>入力情報のリセット</h5>
          <span>
            検索ボックスが空の状態で検索ボタンを押下することで編集をリセット出来ます。
            もしくはページの更新を行ってください。
          </span>
        </li>
        <li>
          <h5>フィルタリング</h5>
          <span>
            フィルタリングされたメンバー情報のみが更新対象です。
            <br />
            修正したメンバーがフィルタリングにより非表示となった場合、更新対象に含まれません。
          </span>
        </li>
      </ul>
    </>
  );
}
