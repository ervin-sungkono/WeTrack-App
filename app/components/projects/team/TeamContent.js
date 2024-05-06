"use client"

import { useState } from "react"
import { FaUserPlus } from "react-icons/fa6"
import SearchBar from "../../common/SearchBar"
import Button from "../../common/button/Button"
import TeamList from "./TeamList"
import InviteForm from "../../common/form/InviteForm"
import PopUpLoad from "../../common/alert/PopUpLoad"
import { ProjectProvider } from "@/app/lib/context/project"
import PopUpForm from "../../common/alert/PopUpForm"

export default function TeamContent(){
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    const [editMode, setEditMode] = useState(false)
    const [addMode, setAddMode] = useState(false)
    const [deleteMode, setDeleteMode] = useState(false)

    const handleEditMember = () => {
        setError(false)
        setLoading(true)
    }

    const handleAddMember = () => {
        setError(false)
        setLoading(true)
    }  

    const handleDeleteMember = () => {
        setError(false)
        setLoading(true)
    }

    const activeTeamDummyData = [
        {
            id: 1,
            name: "Ervin Cahyadinata Sungkono",
            role: "Owner",
            status: "active"
        },
        {
            id: 2,
            name: "Kenneth Nathanael",
            role: "Member",
            status: "active"
        },
        {
            id: 3,
            name: "Christopher Vinantius",
            role: "Member",
            status: "active"
        },
        {
            id: 4,
            name: "No Name",
            role: "Member",
            status: "active"
        },
        {
            id: 5,
            name: "QA Tester",
            role: "Viewer",
            status: "active"
        }
    ]

    const pendingTeamDummyData = [
        {
            id: 1,
            name: "Ervin Cahyadinata Sungkono",
            status: "pending"
        },
        {
            id: 2,
            name: "Kenneth Nathanael",
            status: "pending"
        },
        {
            id: 3,
            name: "Christopher Vinantius",
            status: "pending"
        },
        {
            id: 4,
            name: "No Name",
            status: "pending"
        },
        {
            id: 5,
            name: "QA Tester",
            status: "pending"
        }
    ]

    return (
        <ProjectProvider>
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
                                (0)
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <TeamList list={activeTeamDummyData} listType="active" edit={editMode} handleDelete={() => setDeleteMode(true)}/>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="flex items-baseline mb-2">
                            <div className="font-semibold text-lg">
                                Menunggu Persetujuan
                            </div>
                            <div className="ml-2">
                                (0)
                            </div>
                        </div>
                        <div className="h-full overflow-x-auto">
                            <TeamList list={pendingTeamDummyData} listType="pending" edit={editMode} handleDelete={() => setDeleteMode(true)}/>
                        </div>
                    </div>
                </div>
                {addMode && (
                    <InviteForm 
                        onConfirm={handleAddMember}
                        onClose={() => setAddMode(false)}
                    />
                )}
                {loading && (
                    <PopUpLoad />
                )}
                {deleteMode && (
                    <PopUpForm
                        title="Hapus Anggota"
                        titleSize="large"
                        message={`Apakah Anda yakin ingin menghapus anggota ini?`}
                    >
                        <div className="flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                            <Button variant="secondary" onClick={() => setDeleteMode(false)}>Tidak</Button>
                            <Button variant="danger" onClick={handleDeleteMember}>Ya</Button>
                        </div>
                    </PopUpForm>
                )}
            </div>  
        </ProjectProvider>
    )
}