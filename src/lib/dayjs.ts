import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ja from "dayjs/locale/ja";
import customParseFormat from "dayjs/plugin/customParseFormat";

// プラグインの設定
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.locale(ja);

export default dayjs;
