"use client"
import { useState } from "react"
import Header from "../components/common/Header"
import SelectButton from "../components/common/SelectButton"
import HistoryLayout from "../components/layout/HistoryLayout"
import SortButton from "../components/common/SortButton"

export default function HistoryPage(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Riwayat", url: "/history"},
    ]

    const [project, setProject] = useState("Proyek 1")
    const [type, setType] = useState("Semua")
    const [pageSize, setPageSize] = useState(10)

    const projectOptions = [
        {label: "Proyek 1", value: 1},
        {label: "Proyek 2", value: 2},
        {label: "Proyek 3", value: 3}
    ]

    const typeOptions = [
        {label: "Semua", value: 0},
        {label: "Pembuatan", value: 1},
        {label: "Pembaruan", value: 2},
        {label: "Penghapusan", value: 3}
    ]

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    const handleProjectChange = (value) => {
        setProject(value)
    }
    
    const handleTypeChange = (value) => {
        setType(value)
    }

    const handlePageSizeChange = (value) => {
        setPageSize(value)
    }

    return (
        <HistoryLayout>
            <div className="flex flex-col gap-4">
                <Header title={"Riwayat"} links={links}/>
            </div>
            <div className="h-full flex flex-col mt-4 md:mt-6 gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="w-full flex justify-center md:justify-between items-center gap-3 md:gap-6">
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-2">
                                <b className="hidden xs:block text-xs md:text-sm">Proyek:</b>
                                <SelectButton 
                                    name={"project-button"}
                                    placeholder={project} 
                                    options={projectOptions} 
                                    onChange={handleProjectChange}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <b className="hidden xs:block text-xs md:text-sm">Jenis:</b>
                                <SelectButton 
                                    name={"type-button"}
                                    placeholder={type} 
                                    options={typeOptions} 
                                    onChange={handleTypeChange}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <b className="hidden xs:block text-xs md:text-sm">Tampilkan:</b>
                                <SelectButton 
                                    name={"page-size-button"}
                                    placeholder={pageSize} 
                                    options={pageSizeOptions} 
                                    onChange={handlePageSizeChange}
                                />
                            </div>
                        </div>
                        <SortButton />
                    </div>
                </div>
            </div>
        </HistoryLayout>
    )
}