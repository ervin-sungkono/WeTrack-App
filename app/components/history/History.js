"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { getAllProject } from "@/app/lib/fetch/project"
import { sortDateTimestampFn } from "@/app/lib/helper"

import Header from "../common/Header"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import DashboardLayout from "../layout/DashboardLayout"
import EmptyState from "../common/EmptyState"
import { getUserHistory } from "@/app/lib/fetch/user"
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history"

const HistoryList = dynamic(() => import("../history/HistoryList"))

export default function History(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Riwayat", url: "/history"},
    ]

    const [project, setProject] = useState("Semua")
    const [type, setType] = useState("Semua")
    const [action, setAction] = useState("Semua")
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [pageCount, setPageCount] = useState(0)
    const [historyData, setHistoryData] = useState([])
    const [sorting, setSorting] = useState('desc')

    const [dataFetched, setDataFetched] = useState([])

    useEffect(() => {
        getUserHistory().then(res => {
            const data = res.data 
            data.sort((a, b) => new Date(a.createdAt.seconds) - new Date(b.createdAt.seconds))
            setDataFetched(data)
            setHistoryData(data)
        }).catch(err => {
            console.error(err)
        })
    }, [])

    useEffect(() => {
        if(!historyData || historyData.length <= 0) return
        const totalPageCount = Math.ceil(historyData.length / pageSize)
        setPageCount(totalPageCount)
    }, [historyData, pageSize])
    
    const [projectOptions, setProjectOptions] = useState([])

    useEffect(() => {
        getAllProject()
        .then(projects => {
            if(projects.data){
                const options = projects.data.map(project => ({
                    label: project.projectName,
                    value: project.projectName
                }));
                setProjectOptions([
                    {label: "Semua", value: "Semua"},
                    ...options
                ])
            }
            else alert("Gagal memperoleh data proyek")
        })
    }, [])

    const typeOptions = [
        {label: "Semua", value: "Semua"},
        {label: "Proyek", value: getHistoryEventType.project},
        {label: "Tugas", value: getHistoryEventType.task},
        {label: "Nama Tugas", value: getHistoryEventType.taskName},
        {label: "Status Tugas", value: getHistoryEventType.taskStatus},
        {label: "Penerima", value: getHistoryEventType.assignedTo},
        {label: "Komentar", value: getHistoryEventType.comment},
        {label: "Lampiran", value: getHistoryEventType.attachment},
        {label: "Profil", value: getHistoryEventType.profile}
    ]
    
    const actionOptions = [
        {label: "Semua", value: "Semua"},
        {label: "Pembuatan", value: getHistoryAction.create},
        {label: "Perubahan", value: getHistoryAction.update},
        {label: "Penghapusan", value: getHistoryAction.delete}
    ]

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    useEffect(() => {
        let filteredData = dataFetched;
        if(project !== "Semua"){
            filteredData = filteredData.filter(item => item.project?.projectName === project);
        }
        if(type !== "Semua"){
            filteredData = filteredData.filter(item => item.eventType === type);
        }
        if(action !== "Semua"){
            filteredData = filteredData.filter(item => item.action === action);
        }
        setHistoryData(filteredData);
        setPageIndex(0);
    }, [dataFetched, project, type, action]);
    
    const handleProjectChange = (value) => {
        setProject(value)
    }
    
    const handleTypeChange = (value) => {
        setType(value)
    }

    const handleActionChange = (value) => {
        setAction(value)
    }

    const handlePageSizeChange = (value) => {
        setPageSize(value)
        setPageIndex(0)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4">
                <Header title={"Riwayat"} links={links}/>
            </div>
            <div className="h-full flex flex-col mt-4 md:mt-6 gap-4">
                {historyData && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <div className="w-full flex justify-between items-center gap-3 md:gap-6">
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
                                    <b className="hidden xs:block text-xs md:text-sm">Aksi:</b>
                                    <SelectButton 
                                        name={"action-button"}
                                        placeholder={action} 
                                        options={actionOptions} 
                                        onChange={handleActionChange}
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
                            <SortButton sorting={sorting} setSorting={setSorting}/>
                        </div>
                    </div>
                )}
                {historyData && historyData?.length > 0 ? 
                    <HistoryList
                        historyData={sortDateTimestampFn({data: historyData, sortDirection: sorting, key: 'createdAt'})}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        setPageIndex={setPageIndex}
                        pageCount={pageCount}
                        dataCount={historyData.length}
                    /> :
                    <EmptyState message="Belum ada data riwayat yang tersedia."/>
                }
            </div>
        </DashboardLayout>
    )
}