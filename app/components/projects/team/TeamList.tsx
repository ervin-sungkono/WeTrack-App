"use client";

import TeamItem from "./TeamItem";
import { IoMdPeople as TeamsIcon } from "react-icons/io";
import type { Dispatch, SetStateAction } from "react";
import type { ProjectRole, TeamMember, UserSummary } from "@/app/types/domain";

export type TeamViewMember = TeamMember & { user: UserSummary & { fullName: string } };
export type TeamUpdate = { id: string; fullName: string; oldRole: ProjectRole; newRole: ProjectRole };
export type TeamRemoval = { id: string; fullName: string };

type TeamListProps = {
  list: TeamViewMember[];
  listType: "accepted" | "pending";
  selectUpdate: TeamUpdate[];
  setSelectUpdate: Dispatch<SetStateAction<TeamUpdate[]>>;
  selectDelete: TeamRemoval[];
  setSelectDelete: Dispatch<SetStateAction<TeamRemoval[]>>;
  setAddMode?: () => void;
  query?: string;
  owner?: boolean;
  edit?: boolean;
};

export default function TeamList({
  list,
  listType,
  selectUpdate,
  setSelectUpdate,
  selectDelete,
  setSelectDelete,
  setAddMode,
  query = "",
  owner = false,
  edit = false,
}: TeamListProps) {
  return (
    <>
      {listType === "pending" && list.length === 0 && !edit && (
        query.trim() === "" && owner ? (
          <div className="flex justify-start">
            <TeamItem
              pending
              selectUpdate={selectUpdate}
              setSelectUpdate={setSelectUpdate}
              selectDelete={selectDelete}
              setSelectDelete={setSelectDelete}
              setAddMode={setAddMode}
            />
          </div>
        ) : (
          <div className="min-h-[100px] flex flex-col justify-center items-center gap-2">
            <TeamsIcon size={48} className="text-dark-blue/60" />
            Tidak ada data anggota yang ditemukan.
          </div>
        )
      )}
      <div className="flex flex-row gap-2 md:gap-4">
        {list.map((member) => (
          <TeamItem
            key={member.id}
            id={member.id}
            user={member.user}
            userId={member.userId}
            role={member.role}
            pending={member.status === "pending"}
            selectUpdate={selectUpdate}
            setSelectUpdate={setSelectUpdate}
            selectDelete={selectDelete}
            setSelectDelete={setSelectDelete}
            editMode={edit}
            setAddMode={setAddMode}
          />
        ))}
      </div>
    </>
  );
}
