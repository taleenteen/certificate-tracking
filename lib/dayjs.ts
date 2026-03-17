import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

// Activate plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Set default locale to Thai
dayjs.locale("th");

/**
 * Custom wrapper for dayjs that ensures we use C.E. (Common Era) by default
 * but still benefits from Thai locale naming (months/days).
 */
export const date = (input?: string | number | Date | dayjs.Dayjs) => {
  return dayjs(input);
};

export default dayjs;
