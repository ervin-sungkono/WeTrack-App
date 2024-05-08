"use client"

import { useEffect, useState } from "react"
import { FaUserPlus } from "react-icons/fa6"
import SearchBar from "../../common/SearchBar"
import Button from "../../common/button/Button"
import TeamList from "./TeamList"
import InviteForm from "../../common/form/InviteForm"
import PopUpLoad from "../../common/alert/PopUpLoad"
import PopUpForm from "../../common/alert/PopUpForm"
import { inviteMember, updateRole, deleteMember, getProjectTeam } from "@/app/lib/fetch/project"
import PopUpInfo from "../../common/alert/PopUpInfo"

export default function TeamContent({ projectId }){
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    const [editMode, setEditMode] = useState(false)

    const [addMode, setAddMode] = useState(false)
    const [successAdd, setSuccessAdd] = useState(false)

    const [updateMode, setUpdateMode] = useState(false)
    const [selectUpdate, setSelectUpdate] = useState(null)
    const [successUpdate, setSuccessUpdate] = useState(false)

    const [deleteMode, setDeleteMode] = useState(false)
    const [selectDelete, setSelectDelete] = useState(null)
    const [successDelete, setSuccessDelete] = useState(false)

    const [teams, setTeams] = useState(null)
    const [teamFetched, setTeamFetched] = useState([])
    const [acceptedTeam, setAcceptedTeam] = useState([]) 
    const [pendingTeam, setPendingTeam] = useState([])

    useEffect(() => {
        getProjectTeam(projectId).then(res => {
            if (res.data) {
                const filteredAcceptedTeam = res.data.filter(team => team.status === "accepted" && team.user.fullName.toLowerCase().includes(query))
                const filteredPendingTeam = res.data.filter(team => team.status === "pending" && team.user.fullName.toLowerCase().includes(query))
                setAcceptedTeam(filteredAcceptedTeam)
                setPendingTeam(filteredPendingTeam)
            } else {
                console.log(res)
            }
        })
    }, [projectId, query])

    const handleAddMember = async () => {
        setAddMode(false)
        setError(false)
        setLoading(true)
        try{
            const res = await inviteMember({
                projectId: projectId,
                teams: teams
            })
            if (res.error) {
                setError(true);
                console.log(JSON.parse(res.error).errors)
                setLoading(false)
            } else {
                setSuccessAdd(true)
            }
        }catch(error){
            console.log(error)
            setLoading(false)
        }
    }

    const handleUpdateMember = async () => {
        setUpdateMode(false)
        setError(false)
        setLoading(true)
        try{
            const res = await updateRole({
                projectId: projectId,
                teamId: selectUpdate.id,
                role: selectUpdate.newRole
            })
            if (res.error) {
                setError(true);
                console.log(JSON.parse(res.error).errors)
                setLoading(false)
            } else {
                setSuccessUpdate(true)
            }
        }catch(error){
            console.log(error)
            setLoading(false)
        }
    } 

    const handleDeleteMember = async () => {
        setDeleteMode(false)
        setError(false)
        setLoading(true)
        try{
            const res = await deleteMember({
                projectId: projectId,
                teamId: selectDelete.id
            })
            if(res.error){
                setError(true)
                console.log(JSON.parse(res.error).errors)
                setLoading(false)
            }else{
                setSuccessDelete(true)
            }
        }catch(error){
            console.log(error)
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
                <div className="flex justify-center xs:justify-start items-center">
                    <SearchBar placeholder={"Cari anggota.."} handleSearch={handleSearch}/>
                </div>
                <div className="flex flex-col md:flex-row flex-wrap justify-center gap-2 md:gap-4">
                    {editMode ? (
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                            <Button variant="danger" onClick={() => setEditMode(false)} outline>
                                Batalkan Perubahan
                            </Button>
                            {selectUpdate !== null && (
                                <Button onClick={() => setUpdateMode(true)} outline>
                                    Simpan Perubahan
                                </Button>
                            )}
                        </div>
                        
                    ) : (
                        <Button onClick={() => setEditMode(true)} outline>
                            Kelola Anggota
                        </Button>
                    )}
                    {!editMode && (
                        <Button onClick={() => setAddMode(true)} className="flex items-center">
                            <FaUserPlus className="mr-2"/>
                            Tambah Anggota
                        </Button>
                    )}
                </div>
            </div>
            <div>
                <div>
                    <div className="flex items-baseline mb-2">
                        <div className="font-semibold text-lg">
                            Anggota
                        </div>
                        <div className="ml-2">
                            ({acceptedTeam.length})
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {acceptedTeam.length > 0 ? (
                            <TeamList list={acceptedTeam} listType="accepted" edit={editMode} setSelectUpdate={setSelectUpdate} setSelectDelete={setSelectDelete} handleDelete={() => setDeleteMode(true)}/>
                        ) : (
                            <div className="">
                                Tidak ada data anggota yang ditemukan.
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6">
                    <div className="flex items-baseline mb-2">
                        <div className="font-semibold text-lg">
                            Menunggu Persetujuan
                        </div>
                        <div className="ml-2">
                            ({pendingTeam.length})
                        </div>
                    </div>
                    <div className="h-full overflow-x-auto">
                        <TeamList list={pendingTeam} query={query} listType="pending" edit={editMode} setSelectDelete={setSelectDelete} handleDelete={() => setDeleteMode(true)} setAddMode={setAddMode}/>
                    </div>
                </div>
            </div>
            {loading && (
                <PopUpLoad />
            )}
            {addMode && (
                <InviteForm
                    onConfirm={handleAddMember}
                    onClose={() => setAddMode(false)}
                    team={teamFetched}
                    setTeams={setTeams}
                />
            )}
            {updateMode && (
                <PopUpForm
                    title="Perbarui Peran Anggota"
                    titleSize="large"
                    message={`Apakah Anda yakin ingin memperbarui peran ${selectUpdate?.fullName} dari ${selectUpdate?.oldRole} menjadi ${selectUpdate?.newRole} dalam proyek ini?`}
                    wrapContent
                >
                    <div className="flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                        <Button variant="secondary" onClick={() => {
                            setUpdateMode(false)
                        }}>
                            Tidak
                        </Button>
                        <Button variant="warning" onClick={handleUpdateMember}>Ya</Button>
                    </div>
                </PopUpForm>
            )}
            {deleteMode && (
                <PopUpForm
                    title="Hapus Anggota"
                    titleSize="large"
                    message={`Apakah Anda yakin ingin menghapus ${selectDelete?.fullName} dari proyek ini?`}
                    wrapContent
                >
                    <div className="flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                        <Button variant="secondary" onClick={() => setDeleteMode(false)}>Tidak</Button>
                        <Button variant="danger" onClick={handleDeleteMember}>Ya</Button>
                    </div>
                </PopUpForm>
            )}
            {successAdd &&
                <PopUpInfo
                    title={"Undangan Dikirim"}
                    titleSize={"large"}
                    message={"Email undangan telah dikirimkan kepada pengguna yang dituju."}
                >
                    <div className="flex justify-end gap-2 md:gap-4">
                        <Button onClick={() => {
                            setSuccessAdd(false)
                            location.reload()
                        }} className="w-24 md:w-32">OK</Button>
                    </div>
                </PopUpInfo>
            }
            {successUpdate &&
                <PopUpInfo
                    title={"Peran Anggota Diperbarui"}
                    titleSize={"large"}
                    message={"Anggota yang dipilih telah diperbarui perannya dalam proyek ini."}
                >
                    <div className="flex justify-end gap-2 md:gap-4">
                        <Button onClick={() => {
                            setSuccessUpdate(false)
                            location.reload()
                        }} className="w-24 md:w-32">OK</Button>
                    </div>
                </PopUpInfo>
            }
            {successDelete &&
                <PopUpInfo
                    title={"Anggota Dihapus"}
                    titleSize={"large"}
                    message={"Anggota yang dipilih telah dihapus dari proyek ini."}
                >
                    <div className="flex justify-end gap-2 md:gap-4">
                        <Button onClick={() => {
                            setSuccessDelete(false)
                            location.reload()
                        }} className="w-24 md:w-32">OK</Button>
                    </div>
                </PopUpInfo>
            }
        </div>
    )
}