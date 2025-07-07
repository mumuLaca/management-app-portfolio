import React from "react";

/**
 * datalistで15分間隔の時刻入力プルダウンを表示
 *
 * @param param0
 * @returns
 */
export default function TimeList15() {
  const minutesItemsStart = setTimeList([], 6);
  const minutesItemsEnd = setTimeList([], 17);

  return (
    <>
      <datalist id="data-list-start-15">
        {minutesItemsStart.map((item) => (
          <option value={item} key={item}></option>
        ))}
      </datalist>

      <datalist id="data-list-end-15">
        {minutesItemsEnd.map((item) => (
          <option value={item} key={item}></option>
        ))}
      </datalist>
    </>
  );
}

// 引数の時刻より、時刻配列を作成
function setTimeList(setList: string[], listStartItem: number): string[] {
  for (let hours = listStartItem; hours < listStartItem + 24; hours++) {
    let nowHours = hours;
    if (hours > 23) {
      nowHours = hours - 24;
    }

    for (let minutes = 0; minutes <= 45; minutes += 15) {
      const hourString = nowHours.toString().padStart(2, "0");
      const minuteString = minutes.toString().padStart(2, "0");
      const timeString = `${hourString}:${minuteString}`;
      setList.push(timeString);
    }
  }

  return setList;
}
