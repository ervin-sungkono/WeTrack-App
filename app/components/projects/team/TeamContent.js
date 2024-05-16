"use client"

import { useEffect, useState } from "react"
import { FaUserPlus } from "react-icons/fa6"
import SearchBar from "../../common/SearchBar"
import Button from "../../common/button/Button"
import TeamList from "./TeamList"
import InviteForm from "../../common/form/InviteForm"
import PopUpLoad from "../../common/alert/PopUpLoad"
import PopUpForm from "../../common/alert/PopUpForm"
import { inviteMember, updateRole, deleteMember } from "@/app/lib/fetch/project"
import PopUpInfo from "../../common/alert/PopUpInfo"
import { getQueryReference, getDocumentReference } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"

export default function TeamContent({ projectId }){
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    const [editMode, setEditMode] = useState(false)

    const [addMode, setAddMode] = useState(false)
    const [successAdd, setSuccessAdd] = useState(false)
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const [manageMode, setManageMode] = useState(false)
    const [successManage, setSuccessManage] = useState(false)

    const [selectUpdate, setSelectUpdate] = useState([])
    const [selectDelete, setSelectDelete] = useState([])

    const [teams, setTeams] = useState(null)
    const [role, setRole] = useState(null)
    const [teamFetched, setTeamFetched] = useState([])
    const [acceptedTeam, setAcceptedTeam] = useState([]) 
    const [pendingTeam, setPendingTeam] = useState([])

    useEffect(() => {
        const reference = getQueryReference({ collectionName: "teams", field: "projectId", id: projectId})
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const updatedTeams = await Promise.all(snapshot.docs.map(async(document) => {
                const userId = document.data().userId
                if(userId){
                    const userRef = getDocumentReference({ collectionName: "users", id: userId })
                    const userSnap = await getDoc(userRef)
                    const { fullName, profileImage } = userSnap.data()
                    return({
                        id: document.id,
                        user: {
                            fullName,
                            profileImage
                        },
                        ...document.data()
                    })
                }
                return({
                    id: document.id,
                    user: null,
                    ...document.data()
                })
            }))
            updatedTeams.sort((a, b) => {a.user.fullName.localeCompare(b.user.fullName)})
            updatedTeams.sort((a, b) => {
                if(a.role === "Owner" && b.role !== "Owner") return -1
                if(a.role !== "Owner" && b.role === "Owner") return 1
                return 0
            })
            const filteredAcceptedTeam = updatedTeams.filter(team => team.status === "accepted" && team.user.fullName.toLowerCase().includes(query))
            const filteredPendingTeam = updatedTeams.filter(team => team.status === "pending" && team.user.fullName.toLowerCase().includes(query))
            setAcceptedTeam(filteredAcceptedTeam)
            setPendingTeam(filteredPendingTeam)
            const allTeam = [
                ...filteredAcceptedTeam,
                ...filteredPendingTeam
            ]
            setTeamFetched(allTeam)
        })
        return unsubscribe
    }, [projectId, query])

    const handleAddMember = async () => {
        setAddMode(false)
        setError(false)
        setLoading(true)
        if(teams === null){
            setError(true)
            setErrorMessage("Anggota tim harus diisi.")
            setLoading(false)
            return
        }else if(role === null){
            setError(true)
            setErrorMessage("Peran anggota tim harus dipilih.")
            setLoading(false)
            return
        }
        try{
            const res = await inviteMember({
                projectId: projectId,
                teams: teams,
                role: role,
            })
            if (res.error) {
                setError(true);
                console.log(JSON.parse(res.error).errors)
            } else {
                setSuccessAdd(true)
            }
        }catch(error){
            setError(true)
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    const handleManageMember = async () => {
        setManageMode(false)
        setError(false)
        setLoading(true)
        try{
            if(selectUpdate.length !== 0){
                Promise.all(selectUpdate.map(async (item) => {
                    const res = await updateRole({
                        projectId: projectId,
                        teamId: item.id,
                        role: item.newRole
                    })
                    if (res.error) {
                        setError(true);
                        console.log(JSON.parse(res.error).errors)
                    } else {
                        if(selectDelete.length !== 0){
                            Promise.all(selectDelete.map(async (item) => {
                                const res = await deleteMember({
                                    projectId: projectId,
                                    teamId: item.id
                                })
                                if (res.error) {
                                    setError(true);
                                    console.log(JSON.parse(res.error).errors)
                                } else {
                                    setSuccessManage(true)
                                }
                            }))
                        }else{
                            setSuccessManage(true)
                        }
                    }
                }))
            }else{
                Promise.all(selectDelete.map(async (item) => {
                    const res = await deleteMember({
                        projectId: projectId,
                        teamId: item.id
                    })
                    if (res.error) {
                        setError(true);
                        console.log(JSON.parse(res.error).errors)
                    } else {
                        setSuccessManage(true)
                    }
                }))
            }
        }catch(error){
            console.log(error)
        }finally{
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
                            {(selectUpdate.length !== 0 || selectDelete.length !== 0) && (
                                <Button onClick={() => setManageMode(true)} outline>
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
                            <TeamList list={acceptedTeam} listType="accepted" edit={editMode} selectUpdate={selectUpdate} setSelectUpdate={setSelectUpdate} selectDelete={selectDelete} setSelectDelete={setSelectDelete}/>
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
                        <TeamList list={pendingTeam} query={query} listType="pending" edit={editMode} selectUpdate={selectUpdate} setSelectUpdate={setSelectUpdate} selectDelete={selectDelete} setSelectDelete={setSelectDelete} setAddMode={setAddMode}/>
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
                    setRole={setRole}
                    error={error}
                    errorMessage={errorMessage}
                />
            )}
            {manageMode && (
                <PopUpForm
                    title="Kelola Anggota"
                    titleSize="large"
                    message={`Apakah Anda yakin ingin memperbarui data anggota-anggota berikut dalam proyek ini?`}
                    wrapContent
                >
                    <div className="flex flex-col gap-2 md:gap-4 font-normal text-xs md:text-sm text-dark-blue/80">
                        {selectUpdate.length > 0 && (
                            <div>
                                Pembaruan Peran:
                                {selectUpdate.map((item, index) => (
                                    <div key={index}>
                                        {index+1}. <b>{item.fullName}</b> - dari <b>{item.oldRole}</b> menjadi <b>{item.newRole}</b>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectDelete.length > 0 && (
                            <div>
                                Penghapusan Anggota:
                                {selectDelete.map((item, index) => (
                                    <div key={index}>
                                        {index+1}. <b>{item.fullName}</b>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                        <Button variant="secondary" onClick={() => setManageMode(false)}>Tidak</Button>
                        <Button onClick={handleManageMember}>Ya</Button>
                    </div>
                </PopUpForm>
            )}
            {successAdd &&
                <PopUpInfo
                    title={"Undangan Dikirim"}
                    titleSize={"large"}
                    message={"Email undangan telah dikirimkan kepada pengguna-pengguna yang dituju."}
                >
                    <div className="flex justify-end gap-2 md:gap-4">
                        <Button onClick={() => {
                            setSuccessAdd(false)
                            setSelectUpdate([])
                            setSelectDelete([])
                            setEditMode(false)
                            setLoading(false)
                        }} className="w-24 md:w-32">OK</Button>
                    </div>
                </PopUpInfo>
            }
            {successManage &&
                <PopUpInfo
                    title={"Data Anggota Diperbarui"}
                    titleSize={"large"}
                    message={"Data anggota-anggota dalam proyek ini telah diperbarui."}
                >
                    <div className="flex justify-end gap-2 md:gap-4">
                        <Button onClick={() => {
                            setSuccessManage(false)
                            setSelectUpdate([])
                            setSelectDelete([])
                            setEditMode(false)
                            setLoading(false)
                        }} className="w-24 md:w-32">OK</Button>
                    </div>
                </PopUpInfo>
            }
        </div>
    )
}