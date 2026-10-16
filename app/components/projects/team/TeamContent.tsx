"use client";

import { useEffect, useMemo, useState } from "react";
import { onSnapshot, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaUserPlus } from "react-icons/fa6";
import { IoMdPeople as TeamsIcon } from "react-icons/io";
import SearchBar from "../../common/SearchBar";
import Button from "../../common/button/Button";
import TeamList, { type TeamUpdate, type TeamRemoval, type TeamViewMember } from "./TeamList";
import InviteForm from "../../common/form/InviteForm";
import PopUpLoad from "../../common/alert/PopUpLoad";
import PopUpForm from "../../common/alert/PopUpForm";
import PopUpInfo from "../../common/alert/PopUpInfo";
import { inviteMember, updateRole, deleteMember } from "@/app/lib/fetch/project";
import { getProjectTeamQueryReference, getDocumentReference } from "@/app/firebase/util";
import { useRole } from "@/app/lib/context/role";
import { validateUserRole } from "@/app/lib/helper";
import type { ProjectRole, TeamMember, UserSummary } from "@/app/types/domain";

type TeamContentProps = { projectId: string };

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

export default function TeamContent({ projectId }: TeamContentProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.uid ?? null;
  const userRole = useRole();

  const [editMode, setEditMode] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [successAdd, setSuccessAdd] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teamLoadError, setTeamLoadError] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [successManage, setSuccessManage] = useState(false);
  const [leaveMode, setLeaveMode] = useState(false);
  const [successLeave, setSuccessLeave] = useState(false);
  const [selectUpdate, setSelectUpdate] = useState<TeamUpdate[]>([]);
  const [selectDelete, setSelectDelete] = useState<TeamRemoval[]>([]);
  const [teams, setTeams] = useState<string | null>(null);
  const [role, setRole] = useState<ProjectRole | null>(null);
  const [teamFetched, setTeamFetched] = useState<TeamViewMember[]>([]);

  const isOwner = userRole === "Owner";
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const { acceptedTeam, pendingTeam } = useMemo(() => {
    const visible = teamFetched
      .filter((member) => member.user?.fullName?.toLocaleLowerCase().includes(normalizedQuery) ?? normalizedQuery === "")
      .sort((left, right) => {
        if (left.role === "Owner" && right.role !== "Owner") return -1;
        if (left.role !== "Owner" && right.role === "Owner") return 1;
        return (left.user?.fullName ?? "").localeCompare(right.user?.fullName ?? "");
      });
    return {
      acceptedTeam: visible.filter((member) => member.status === "accepted"),
      pendingTeam: visible.filter((member) => member.status === "pending"),
    };
  }, [teamFetched, normalizedQuery]);

  useEffect(() => {
    // RoleProvider resolves only after the Firebase bridge is ready. Do not
    // issue an unfiltered project query while the caller's role is unknown.
    if (!projectId || !userId || !userRole) return;

    let active = true;
    const reference = getProjectTeamQueryReference({ projectId, includePending: userRole === "Owner" });
    const unsubscribe = onSnapshot(
      reference,
      async (snapshot) => {
        try {
          const updatedTeams = await Promise.all(snapshot.docs.map(async (document): Promise<TeamViewMember> => {
            const member: TeamMember = { id: document.id, ...document.data() };
            const profileReference = getDocumentReference({ collectionName: "users", id: member.userId });
            const profileSnapshot = await getDoc(profileReference);
            const profile = profileSnapshot.exists() ? profileSnapshot.data() : null;
            const user: UserSummary & { fullName: string } = {
              id: member.userId,
              fullName: profile?.fullName || "Anggota",
              profileImage: profile?.profileImage ?? null,
            };
            return { ...member, user };
          }));
          if (active) {
            setTeamFetched(updatedTeams);
            setTeamLoadError(false);
          }
        } catch (loadError) {
          console.error("Failed to load project team profiles", loadError);
          if (active) setTeamLoadError(true);
        }
      },
      (listenerError) => {
        console.error("Failed to subscribe to the project team", listenerError);
        if (active) setTeamLoadError(true);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [projectId, userId, userRole]);

  const handleSearch = (value: string) => setQuery(value);

  const handleAddMember = async () => {
    setAddMode(false);
    setError(false);
    if (teams == null) {
      setError(true);
      setErrorMessage("Anggota tim harus diisi!");
      return;
    }
    if (role == null) {
      setError(true);
      setErrorMessage("Peran anggota tim harus dipilih!");
      return;
    }

    setLoading(true);
    try {
      await inviteMember({ projectId, teams, role });
      setSuccessAdd(true);
    } catch (requestError) {
      setError(true);
      setErrorMessage(errorText(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleManageMember = async () => {
    setManageMode(false);
    setError(false);
    setLoading(true);
    try {
      await Promise.all([
        ...selectUpdate.map((item) => updateRole({ projectId, teamId: item.id, role: item.newRole })),
        ...selectDelete.map((item) => deleteMember({ projectId, teamId: item.id })),
      ]);
      setSuccessManage(true);
    } catch (requestError) {
      setError(true);
      setErrorMessage(errorText(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    setLeaveMode(false);
    const membership = teamFetched.find((member) => member.userId === userId && member.status === "accepted");
    if (!membership) {
      setError(true);
      setErrorMessage("Keanggotaan proyek Anda tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      await deleteMember({ projectId, teamId: membership.id });
      setSuccessLeave(true);
    } catch (requestError) {
      setError(true);
      setErrorMessage(errorText(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
        <div className="flex justify-center xs:justify-start items-center">
          <SearchBar placeholder="Cari anggota..." handleSearch={handleSearch} />
        </div>
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-2 md:gap-4">
          {validateUserRole({ userRole, minimumRole: "Owner" }) && (
            <>
              {editMode ? (
                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                  <Button
                    variant="danger"
                    onClick={() => {
                      setEditMode(false);
                      setSelectUpdate([]);
                      setSelectDelete([]);
                    }}
                    outline
                  >
                    Batalkan Perubahan
                  </Button>
                  {(selectUpdate.length > 0 || selectDelete.length > 0) && (
                    <Button onClick={() => setManageMode(true)} outline>Simpan Perubahan</Button>
                  )}
                </div>
              ) : (
                <Button onClick={() => setEditMode(true)} outline>Kelola Anggota</Button>
              )}
            </>
          )}
          {isOwner && !editMode && (
            <Button onClick={() => setAddMode(true)} className="flex items-center">
              <FaUserPlus className="mr-2" />
              Undang Anggota
            </Button>
          )}
          {(userRole === "Member" || userRole === "Viewer") && (
            <Button variant="danger" onClick={() => setLeaveMode(true)}>Tinggalkan Proyek</Button>
          )}
        </div>
      </div>

      {teamLoadError && (
        <p role="alert" className="text-sm text-danger-red">
          Data anggota proyek tidak dapat dimuat. Segarkan halaman untuk mencoba lagi.
        </p>
      )}
      {error && <p role="alert" className="text-sm text-danger-red">{errorMessage}</p>}

      <div>
        <div className="flex items-baseline justify-center md:justify-start">
          <div className="font-semibold text-lg">Anggota</div>
          <div className="ml-2">({acceptedTeam.length})</div>
        </div>
        <div className="overflow-x-auto">
          {acceptedTeam.length > 0 ? (
            <TeamList
              list={acceptedTeam}
              listType="accepted"
              edit={editMode}
              selectUpdate={selectUpdate}
              setSelectUpdate={setSelectUpdate}
              selectDelete={selectDelete}
              setSelectDelete={setSelectDelete}
            />
          ) : (
            <div className="min-h-[100px] flex flex-col justify-center items-center gap-2">
              <TeamsIcon size={48} className="text-dark-blue/60" />
              Tidak ada data anggota yang ditemukan.
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-center md:justify-start mt-4 md:mt-0">
          <div className="font-semibold text-lg">Menunggu Persetujuan</div>
          <div className="ml-2">({pendingTeam.length})</div>
        </div>
        <div className="h-full overflow-x-auto">
          <TeamList
            list={pendingTeam}
            query={query}
            owner={isOwner}
            listType="pending"
            edit={editMode}
            selectUpdate={selectUpdate}
            setSelectUpdate={setSelectUpdate}
            selectDelete={selectDelete}
            setSelectDelete={setSelectDelete}
            setAddMode={() => setAddMode(true)}
          />
        </div>
      </div>

      {loading && <PopUpLoad />}
      {addMode && (
        <InviteForm
          onConfirm={handleAddMember}
          onClose={() => setAddMode(false)}
          team={teamFetched}
          setTeams={setTeams}
          setRole={setRole}
          error={error}
          errorMessage={errorMessage}
        />
      )}
      {manageMode && (
        <PopUpForm
          title="Kelola Anggota"
          titleSize="large"
          message="Apakah Anda yakin ingin memperbarui data anggota-anggota berikut dalam proyek ini?"
          wrapContent
        >
          <div className="flex flex-col gap-2 md:gap-4 font-normal text-xs md:text-sm text-dark-blue/80">
            {selectUpdate.length > 0 && (
              <div>
                Pembaruan Peran:
                {selectUpdate.map((item, index) => (
                  <div key={item.id}>
                    {index + 1}. <b>{item.fullName}</b> - dari <b>{item.oldRole}</b> menjadi <b>{item.newRole}</b>
                  </div>
                ))}
              </div>
            )}
            {selectDelete.length > 0 && (
              <div>
                Penghapusan Anggota:
                {selectDelete.map((item, index) => <div key={item.id}>{index + 1}. <b>{item.fullName}</b></div>)}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
            <Button variant="secondary" onClick={() => setManageMode(false)}>Tidak</Button>
            <Button onClick={handleManageMember}>Ya</Button>
          </div>
        </PopUpForm>
      )}
      {leaveMode && (
        <PopUpForm title="Tinggalkan Proyek" titleSize="large" message="Apakah Anda yakin ingin meninggalkan proyek ini?" wrapContent>
          <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
            <Button variant="danger" onClick={handleLeaveProject}>Ya</Button>
            <Button variant="secondary" onClick={() => setLeaveMode(false)}>Tidak</Button>
          </div>
        </PopUpForm>
      )}
      {successAdd && (
        <PopUpInfo title="Undangan Dikirim" message="Email undangan telah dikirimkan kepada pengguna-pengguna yang dituju.">
          <div className="flex justify-end gap-2 md:gap-4">
            <Button onClick={() => {
              setSuccessAdd(false);
              setSelectUpdate([]);
              setSelectDelete([]);
              setEditMode(false);
            }} className="w-24 md:w-32">OK</Button>
          </div>
        </PopUpInfo>
      )}
      {successManage && (
        <PopUpInfo title="Data Anggota Diperbarui" message="Data anggota-anggota dalam proyek ini telah diperbarui.">
          <div className="flex justify-end gap-2 md:gap-4">
            <Button onClick={() => {
              setSuccessManage(false);
              setSelectUpdate([]);
              setSelectDelete([]);
              setEditMode(false);
            }} className="w-24 md:w-32">OK</Button>
          </div>
        </PopUpInfo>
      )}
      {successLeave && (
        <PopUpInfo title="Anda Telah Meninggalkan Proyek" message="Anda akan dialihkan ke halaman daftar proyek.">
          <div className="flex justify-end gap-2 md:gap-4">
            <Button onClick={() => {
              setSuccessLeave(false);
              router.push("/projects");
            }} className="w-24 md:w-32">OK</Button>
          </div>
        </PopUpInfo>
      )}
    </div>
  );
}
