/** 値を3桁カンマ区切りに編集 */
export const editComma = (value: number | string | undefined) => {
  // 値が存在しない場合"0"を返却
  if (!value) return "0";
  // number型はstring型に変換
  if (typeof value === "number") {
    value = value.toString();
  }
  // カンマ区切りした値を返却
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
