import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import { Japanese } from "flatpickr/dist/l10n/ja";
import dayjs from "dayjs";
import { DailyReportType } from "@/lib/constants";

/**
 * @description
 * 年月選択ピッカー
 *
 * @param onChane 年月選択時のコールバック関数
 */
export default function MonthPicker({
  onChange,
  dailyReportType,
  value,
}: {
  onChange?: (date: string) => void;
  dailyReportType?: string;
  value?: string;
}) {
  const inputRef = useRef(null);

  const rangeStartYM = dayjs(dayjs().toDate())
    .startOf("month")
    .subtract(1, "year")
    .toDate(); // 1年前の月初日
  const rangeEndYM = dayjs(dayjs().toDate())
    .startOf("month")
    .add(2, "year")
    .toDate(); // 2年後の月初日

  useEffect(() => {
    const fp = flatpickr(inputRef.current!, {
      defaultDate: value, // 初期値
      locale: Japanese,
      altInput: true,
      minDate: rangeStartYM, // 過去は2020年1月1日から選択可能
      maxDate: rangeEndYM, // 今日まで選択可能
      plugins: [
        monthSelectPlugin({
          dateFormat: "Y-m", // フォームの送信用 → 例: "2025-04"
          altFormat: "Y年m月", // 画面表示用 → 例: "2025年04月"
        }),
      ],
      onChange: (_, dateStr) => {
        onChange?.(dateStr); // 親componentからonChangeメソッドが渡されていた場合実行
      },
      disable: [
        function (date) {
          if (dailyReportType === DailyReportType.quarter.code) {
            return date.getMonth() % 3 !== 0; // 3ヶ月ごとに選択可能
          }
          return false; // それ以外は選択可能
        },
      ],
    });

    return () => {
      fp.destroy(); // クリーンアップ
    };
  }, [onChange, dailyReportType, rangeEndYM, rangeStartYM, value]);

  return (
    <input
      type="text"
      ref={inputRef}
      placeholder="年月を選択"
      className="form-control monthPicker"
    />
  );
}
