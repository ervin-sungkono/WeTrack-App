import UserIcon from "@/app/components/common/UserIcon";
import Label from "@/app/components/common/Label";
import { listDateFormat } from "@/app/lib/date";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { GoArrowRight as ArrowIcon } from "react-icons/go";
import type { HistoryEntry, UserSummary } from "@/app/types/domain";

interface TaskHistoryItemProps {
  history: HistoryEntry;
}

function asUserSummary(value: unknown): UserSummary | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" && typeof record.fullName !== "string") return null;
  const profileImage = record.profileImage;
  return {
    id: typeof record.id === "string" ? record.id : "unknown",
    fullName: typeof record.fullName === "string" ? record.fullName : undefined,
    profileImage: typeof profileImage === "string" || profileImage === null || typeof profileImage === "object"
      ? profileImage as UserSummary["profileImage"]
      : undefined,
  };
}

function asText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null && "statusName" in value && typeof value.statusName === "string") return value.statusName;
  return "-";
}

function getProfileImage(value: UserSummary | null): string | null {
  const image = value?.profileImage;
  if (typeof image === "string") return image;
  return image?.attachmentStoragePath ?? null;
}

export default function TaskHistoryItem({ history }: TaskHistoryItemProps) {
  const previousUser = asUserSummary(history.previousValue);
  const nextUser = asUserSummary(history.newValue);
  const renderHistoryUpdate = () => {
    if (history.eventType === getHistoryEventType.assignedTo) {
      return <div className="flex items-center gap-1.5 text-xs md:text-sm text-dark-blue">
        <div className="flex gap-1 items-center"><UserIcon size="xs" fullName={previousUser?.fullName} src={getProfileImage(previousUser) ?? "/images/user-placeholder.png"} /><p className="font-semibold text-dark-blue/80">{previousUser?.fullName ?? "Belum Ditugaskan"}</p></div>
        <ArrowIcon size={16} className="flex-shrink-0" />
        <div className="flex gap-1 items-center"><UserIcon size="xs" fullName={nextUser?.fullName} src={getProfileImage(nextUser) ?? "/images/user-placeholder.png"} /><p className="font-semibold text-dark-blue/80">{nextUser?.fullName ?? "Belum Ditugaskan"}</p></div>
      </div>;
    }
    if (history.eventType === getHistoryEventType.taskName || history.eventType === getHistoryEventType.taskStatus) {
      return <div className="flex gap-1.5 items-center text-xs md:text-sm text-dark-blue">
        <Label color="#47389F" text={asText(history.previousValue)} />
        <ArrowIcon size={16} className="flex-shrink-0" />
        <Label color="#47389F" text={asText(history.newValue)} />
      </div>;
    }
    return null;
  };

  return <div className="flex items-start gap-2 md:gap-3">
    <div><UserIcon size="sm" fullName={history.user?.fullName} src={getProfileImage(history.user ?? null) ?? "/images/user-placeholder.png"} /></div>
    <div className="flex flex-col gap-1.5 pt-1">
      <div className="flex gap-2 items-center">
        <p className="text-xs md:text-sm text-dark-blue"><span className="font-semibold">{history.user?.fullName ?? "Sistem"}</span> {history.action} <span className="font-semibold">{history.eventType}</span></p>
        <p className="text-[11.2px] md:text-sm text-dark-blue/80">{listDateFormat(history.createdAt ?? null)}</p>
      </div>
      {history.action === getHistoryAction.update && renderHistoryUpdate()}
    </div>
  </div>;
}
