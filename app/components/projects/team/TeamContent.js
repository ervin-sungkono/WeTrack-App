"use client"

import { useEffect, useState } from "react"
import { FaUserPlus } from "react-icons/fa6"
import SearchBar from "../../common/SearchBar"
import Button from "../../common/button/Button"
import TeamList from "./TeamList"
import InviteForm from "../../common/form/InviteForm"
import PopUpLoad from "../../common/alert/PopUpLoad"
import PopUpForm from "../../common/alert/PopUpForm"
import { inviteMember, deleteMember, getProjectTeam } from "@/app/lib/fetch/project"

export default function TeamContent({ projectId }){
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    const [editMode, setEditMode] = useState(false)
    const [addMode, setAddMode] = useState(false)
    const [deleteMode, setDeleteMode] = useState(false)
    const [selectDelete, setSelectDelete] = useState(null)
    const [teams, setTeams] = useState(null)
    const [teamFetched, setTeamFetched] = useState([])
    const acceptedTeam = teamFetched.filter(team => team.status === "accepted")
    const pendingTeam = teamFetched.filter(team => team.status === "pending")

    useEffect(() => {
        getProjectTeam(projectId).then(res => {
            if(res.data){
                setTeamFetched(res.data)
            }else{
                console.log(res)
            }
        })
    }, [projectId])

    const handleAddMember = async () => {
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
                setLoading(false)
                location.reload()
            }
        }catch(error){
            console.log(error)
            setLoading(false)
        }
    }

    const handleEditMember = () => {
        setError(false)
        setLoading(true)
    } 

    const handleDeleteMember = () => {
        setError(false)
        setLoading(true)
        try{
            const res = deleteMember({
                projectId: projectId,
                teamId: selectDelete.id
            })
            if(res.error){
                setError(true)
                console.log(JSON.parse(res.error).errors)
                setLoading(false)
            }else{
                setLoading(false)
                location.reload()
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
                            <Button onClick={() => setEditMode(handleEditMember)} outline>
                                Simpan Perubahan
                            </Button>
                        </div>
                        
                    ) : (
                        <Button onClick={() => setEditMode(true)} outline>
                            Kelola Anggota
                        </Button>
                    )}
                    <Button onClick={() => setAddMode(true)} className="flex items-center">
                        <FaUserPlus className="mr-2"/>
                        Tambah Anggota
                    </Button>
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
                        <TeamList list={acceptedTeam} listType="active" edit={editMode} setSelectDelete={setSelectDelete} handleDelete={() => setDeleteMode(true)}/>
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
                        <TeamList list={pendingTeam} listType="pending" edit={editMode} setSelectDelete={setSelectDelete} handleDelete={() => setDeleteMode(true)}/>
                    </div>
                </div>
            </div>
            {addMode && (
                <InviteForm
                    onConfirm={handleAddMember}
                    onClose={() => setAddMode(false)}
                    team={teamFetched}
                    setTeams={setTeams}
                />
            )}
            {loading && (
                <PopUpLoad />
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
        </div>
    )
}