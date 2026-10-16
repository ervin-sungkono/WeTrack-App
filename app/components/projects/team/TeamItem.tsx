"use client";

import UserIcon from "../../common/UserIcon";
import SelectButton from "../../common/button/SelectButton";
import { IoIosCloseCircle as CloseCircle } from "react-icons/io";
import Button from "../../common/button/Button";
import Link from "next/link";
import type { ProjectRole, UserSummary } from "@/app/types/domain";
import type { TeamRemoval, TeamUpdate } from "./TeamList";

type TeamItemProps = {
  id?: string;
  user?: UserSummary | null;
  userId?: string;
  role?: ProjectRole;
  pending?: boolean;
  editMode?: boolean;
  selectUpdate: TeamUpdate[];
  setSelectUpdate: (value: TeamUpdate[]) => void;
  selectDelete: TeamRemoval[];
  setSelectDelete: (value: TeamRemoval[]) => void;
  setAddMode?: () => void;
};

const roleOptions = [
  { label: "Member", value: "Member" },
  { label: "Viewer", value: "Viewer" },
] as const;

export default function TeamItem({
  selectUpdate,
  setSelectUpdate,
  selectDelete,
  setSelectDelete,
  editMode = false,
  id,
  user,
  userId,
  role,
  pending = false,
  setAddMode,
}: TeamItemProps) {
  const selectedUpdate = selectUpdate.find((item) => item.id === id);
  const roleSelected = selectedUpdate?.newRole ?? role;
  const deleteSelected = selectDelete.some((item) => item.id === id);

  const profileImage = typeof user?.profileImage === "object" && user.profileImage !== null
    ? user.profileImage.attachmentStoragePath
    : typeof user?.profileImage === "string" ? user.profileImage : null;

  const handleRoleChange = (value: string | number | null) => {
    if (!id || !role || (value !== "Member" && value !== "Viewer")) return;
    const nextRole: ProjectRole = value;
    if (nextRole === role) {
      setSelectUpdate(selectUpdate.filter((item) => item.id !== id));
      return;
    }
    if (selectDelete.some((item) => item.id === id)) {
      setSelectDelete(selectDelete.filter((item) => item.id !== id));
    }
    const nextUpdate: TeamUpdate = {
      id,
      fullName: user?.fullName ?? "Anggota",
      oldRole: role,
      newRole: nextRole,
    };
    setSelectUpdate([...selectUpdate.filter((item) => item.id !== id), nextUpdate]);
  };

  const handleUserDelete = () => {
    if (!id || !user) return;
    const isSelected = selectDelete.some((item) => item.id === id);
    if (isSelected) {
      setSelectDelete(selectDelete.filter((item) => item.id !== id));
      return;
    }
    if (selectUpdate.some((item) => item.id === id)) {
      setSelectUpdate(selectUpdate.filter((item) => item.id !== id));
    }
    setSelectDelete([...selectDelete, { id, fullName: user.fullName ?? "Anggota" }]);
  };

  const selectedRoleClass = editMode && deleteSelected
    ? "border-white text-white"
    : roleSelected === "Owner"
      ? "border-[#E1B829] text-[#E1B829]"
      : roleSelected === "Viewer"
        ? "border-success-green text-success-green"
        : "border-basic-blue text-basic-blue";
  const roleClass = role === "Owner"
    ? "bg-warning-yellow text-black"
    : role === "Viewer" ? "bg-success-green text-white" : "bg-basic-blue text-white";

  return (
    <div className="relative my-4">
      {editMode && role !== "Owner" && !pending && (
        <button
          type="button"
          aria-label={`Remove ${user?.fullName ?? "team member"}`}
          onClick={handleUserDelete}
          className="absolute -top-4 -right-4 text-danger-red cursor-pointer"
        >
          <CloseCircle aria-hidden="true" className="text-3xl" />
        </button>
      )}
      <div className={`h-full flex flex-col justify-between items-center m-auto px-3 md:px-6 py-2.5 md:py-4 rounded-xl shadow-md ${pending ? "bg-light-blue" : (editMode && deleteSelected) ? "bg-danger-red" : "bg-white"} w-48 md:w-64`}>
        {!pending ? (
          <div className="mt-4">
            {editMode ? (
              <UserIcon fullName={user?.fullName} size="team" src={profileImage} />
            ) : (
              <Link href={`/profile/${userId ?? ""}`}>
                <div className="hover:brightness-75"><UserIcon fullName={user?.fullName} size="team" src={profileImage} /></div>
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-4"><UserIcon size="team" src="/images/user-placeholder.png" /></div>
        )}

        {!pending && (
          editMode ? (
            <div className={`mt-4 font-semibold ${deleteSelected ? "text-white" : "text-dark-blue"} text-center text-sm md:text-base leading-4 md:leading-5`}>
              {user?.fullName ?? "Anggota"}
            </div>
          ) : (
            <Link href={`/profile/${userId ?? ""}`}>
              <div className="mt-4 font-semibold text-dark-blue text-center text-sm md:text-base leading-4 md:leading-5">
                {user?.fullName ?? "Anggota"}
              </div>
            </Link>
          )
        )}

        {editMode && role !== "Owner" && role ? (
          <div className="my-4">
            <SelectButton
              name={id ?? "member-role"}
              placeholder={roleSelected ?? role}
              defaultValue={{ label: roleSelected ?? role, value: roleSelected ?? role }}
              options={[...roleOptions]}
              onChange={handleRoleChange}
              buttonClass={selectedRoleClass}
            />
          </div>
        ) : role ? (
          <button type="button" className={`cursor-default my-4 text-xs md:text-sm px-3 md:px-4 py-2 md:py-1.5 rounded-full font-medium ${roleClass}`}>
            {role}
          </button>
        ) : null}

        {pending && (
          <Button variant="primary" onClick={setAddMode}>Undang Anggota</Button>
        )}
      </div>
    </div>
  );
}
