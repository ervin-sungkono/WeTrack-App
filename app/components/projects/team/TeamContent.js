"use client"

import { useState } from "react"
import { FaUserPlus } from "react-icons/fa6";

import SearchBar from "../../common/SearchBar"
import Button from "../../common/button/Button"
import TeamList from "./TeamList";

export default function TeamContent(){
    const [query, setQuery] = useState("")

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
                <div className="w-full flex justify-center xs:justify-start items-center">
                    <SearchBar placeholder={"Cari anggota.."} handleSearch={handleSearch}/>
                </div>
                <div className="flex gap-3 md:gap-6">
                    <Button outline>
                        Atur Anggota
                    </Button>
                    <Button className="flex items-center">
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
                        <TeamList list="active" />
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
                        <TeamList list="pending" />
                    </div>
                </div>
            </div>
        </div>
    )
}