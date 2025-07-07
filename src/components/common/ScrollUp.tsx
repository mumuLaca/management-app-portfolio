import React from "react";
import styles from "@/styles/ScrollUp.module.css";

/**
 * @description
 * スクロールコンポーネント
 */
export default function ScrollUp() {
  /** 画面TOPへスクロール */
  const openContents = () => {
    document.getElementById("top")?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  return (
    <i
      className={`bi bi-arrow-up-circle-fill ${styles.scrollIcon}`}
      onClick={() => openContents()}
    ></i>
  );
}
