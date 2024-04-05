"use client"

import { useState } from "react"
import { FaUserPlus } from "react-icons/fa6"
import SearchBar from "../../common/SearchBar"
import Button from "../../common/button/Button"
import TeamList from "./TeamList"
import InviteForm from "../../common/form/InviteForm"
import PopUpLoad from "../../common/alert/PopUpLoad"
import { ProjectProvider } from "@/app/lib/context/project"

export default function TeamContent(){
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    const [editMode, setEditMode] = useState(false)
    const [addMode, setAddMode] = useState(false)

    const handleEditMember = () => {
        setError(false)
        setLoading(true)
    }

    const handleAddMember = () => {
        setError(false)
        setLoading(true)
    }   

    return (
        <ProjectProvider>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
                    <div className="w-full flex justify-center xs:justify-start items-center">
                        <SearchBar placeholder={"Cari anggota.."} handleSearch={handleSearch}/>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                        {editMode && (
                            <Button variant="danger" onClick={() => setEditMode(false)} outline>
                                Batalkan Perubahan
                            </Button>
                        )}
                        {editMode ? (
                            <Button onClick={() => setEditMode(handleEditMember)} outline>
                                Simpan Perubahan
                            </Button>
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
                            <div className="font-bold text-lg">
                                Anggota
                            </div>
                            <div className="ml-2">
                                (0)
                            </div>
                        </div>
                        <div className="overflow-auto">
                            <TeamList list="active" edit={editMode} />
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="flex items-baseline mb-2">
                            <div className="font-bold text-lg">
                                Menunggu Persetujuan
                            </div>
                            <div className="ml-2">
                                (0)
                            </div>
                        </div>
                        <div className="overflow-auto">
                            <TeamList list="pending" edit={editMode} />
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
            </div>  
        </ProjectProvider>
    )
}