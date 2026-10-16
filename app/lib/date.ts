import moment, { type MomentInput } from "moment";
import "moment/locale/id";
import type { FirestoreTimestampLike } from "@/app/types/domain";

moment.locale("id");

function asMomentInput(date: FirestoreTimestampLike): MomentInput {
  if (typeof date === "object" && date !== null && "toDate" in date && typeof date.toDate === "function") {
    return date.toDate();
  }
  if (typeof date === "object" && date !== null && "seconds" in date && typeof date.seconds === "number") {
    return date.seconds * 1000;
  }
  if (typeof date === "number") return date * 1000;
  return date;
}

export function dateFormat(date: FirestoreTimestampLike, includeTime = false): string | null {
  if (date == null) return null;
  const formatString = includeTime ? "D MMMM YYYY HH:mm" : "D MMMM YYYY";
  return moment(asMomentInput(date)).format(formatString);
}

export function listDateFormat(date: FirestoreTimestampLike): string {
  if (date == null) return "Invalid date";
  const momentDate = moment(asMomentInput(date));
  if (!momentDate.isValid()) return "Invalid date";

  const startOfToday = moment().startOf("day");
  const startOfYesterday = startOfToday.clone().subtract(1, "day");
  if (momentDate.isSameOrAfter(startOfToday)) return momentDate.format("[Hari ini], HH:mm");
  if (momentDate.isSameOrAfter(startOfYesterday) && momentDate.isBefore(startOfToday)) {
    return momentDate.format("[Kemarin], HH:mm");
  }
  return momentDate.format("D MMM YYYY, HH:mm");
}
