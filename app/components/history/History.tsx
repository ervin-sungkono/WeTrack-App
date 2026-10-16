"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { IoFilter as FilterIcon } from "react-icons/io5"
import { FaFilterCircleXmark as CloseFilterIcon } from "react-icons/fa6"
import { getAllProject } from "@/app/lib/fetch/project"
import { getUserHistory } from "@/app/lib/fetch/user"
import { getHistoryEventType } from "@/app/lib/history"
import { sortDateTimestampFn, type SortDirection } from "@/app/lib/helper"
import type { SelectOption, HistoryRow } from "../types"
import Header from "../common/Header"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import Button from "../common/button/Button"
import EmptyState from "../common/EmptyState"
import DashboardLayout from "../layout/DashboardLayout"

const HistoryList = dynamic(() => import("../history/HistoryList"))

const links = [
    { label: "Beranda", url: "/" },
    { label: "Riwayat", url: "/history" },
]

const typeOptions: SelectOption<string>[] = [
    { label: "Proyek", value: getHistoryEventType.project },
    { label: "Tugas", value: getHistoryEventType.task },
    { label: "Subtugas", value: getHistoryEventType.subtask },
    { label: "Nama Tugas", value: getHistoryEventType.taskName },
    { label: "Status Tugas", value: getHistoryEventType.taskStatus },
    { label: "Penerima", value: getHistoryEventType.assignedTo },
    { label: "Komentar", value: getHistoryEventType.comment },
    { label: "Lampiran", value: getHistoryEventType.attachment },
    { label: "Profil", value: getHistoryEventType.profile },
]

const pageSizeOptions: SelectOption<number>[] = [
    { label: "10", value: 10 },
    { label: "25", value: 25 },
    { label: "50", value: 50 },
]

export default function History() {
    const [project, setProject] = useState<string | null>(null)
    const [type, setType] = useState<string | null>(null)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [sorting, setSorting] = useState<SortDirection>("desc")
    const [filterDropdown, setFilterDropdown] = useState(false)
    const [dataFetched, setDataFetched] = useState<HistoryRow[]>([])
    const [projectOptions, setProjectOptions] = useState<SelectOption<string>[]>([])

    useEffect(() => {
        let active = true
        void getUserHistory().then((response) => {
            if (active) setDataFetched((response.data ?? []) as HistoryRow[])
        }).catch((error: unknown) => {
            console.error("Unable to load history", error)
        })
        return () => { active = false }
    }, [])

    useEffect(() => {
        let active = true
        void getAllProject().then((response) => {
            if (!active) return
            const projects = response.data ?? []
            setProjectOptions(projects.map(({ projectName }) => ({ label: projectName, value: projectName })))
        }).catch((error: unknown) => {
            console.error("Unable to load project filters", error)
        })
        return () => { active = false }
    }, [])

    const historyData = useMemo(() => dataFetched.filter((item) => {
        if (project !== null && item.project?.projectName !== project) return false
        if (type !== null && item.eventType !== type) return false
        return true
    }), [dataFetched, project, type])
    const pageCount = Math.ceil(historyData.length / pageSize)

    const handleProjectChange = (value: string | null) => {
        setProject(value)
        setPageIndex(0)
    }
    const handleTypeChange = (value: string | null) => {
        setType(value)
        setPageIndex(0)
    }
    const handlePageSizeChange = (value: number) => {
        setPageSize(value)
        setPageIndex(0)
    }
    const resetFilter = () => {
        setProject(null)
        setType(null)
        setPageIndex(0)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4">
                <Header title="Riwayat" links={links} />
            </div>
            <div className="flex-grow overflow-y-auto flex flex-col mt-4 md:mt-6 gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="w-full flex justify-between items-center gap-3 md:gap-6 z-almostFixed">
                        <div className="relative">
                            <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown((shown) => !shown)}>
                                <FilterIcon size={20} />
                            </button>
                            <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 left-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row flex-wrap gap-2 md:gap-4`}>
                                <div className="flex items-center gap-2">
                                    <b className="hidden xs:block text-xs md:text-sm">Proyek:</b>
                                    <SelectButton name="project-button" options={[{ label: "Proyek", value: null }, ...projectOptions]} onChange={handleProjectChange} reset={!project} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <b className="hidden xs:block text-xs md:text-sm">Jenis:</b>
                                    <SelectButton name="type-button" options={[{ label: "Jenis", value: null }, ...typeOptions.map(({ label, value }) => ({ label, value }))]} onChange={handleTypeChange} reset={!type} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <b className="hidden xs:block text-xs md:text-sm">Tampilkan:</b>
                                    <SelectButton name="page-size-button" options={pageSizeOptions} onChange={handlePageSizeChange} />
                                </div>
                                {(project || type) && <Button variant="primary" size="sm" onClick={resetFilter}>
                                    <div className="flex items-center gap-2"><CloseFilterIcon size={16} /><p>Hapus Filter</p></div>
                                </Button>}
                            </div>
                        </div>
                        <SortButton sorting={sorting} setSorting={setSorting} />
                    </div>
                </div>
                {historyData.length > 0 ? (
                    <HistoryList
                        historyData={sortDateTimestampFn({ data: historyData, sortDirection: sorting, key: "createdAt" })}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        setPageIndex={setPageIndex}
                        pageCount={pageCount}
                        dataCount={historyData.length}
                    />
                ) : <EmptyState message="Belum ada data riwayat yang tersedia." />}
            </div>
        </DashboardLayout>
    )
}
