"use client"
import { useEffect, useState } from "react"
import { getRecentProjects } from "@/app/lib/fetch/project"
import { sortDateFn } from "@/app/lib/helper"

import Header from "../common/Header"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import HistoryList from "../history/HistoryList"
import DashboardLayout from "../layout/DashboardLayout"

export default function History(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Riwayat", url: "/history"},
    ]

    const [projectOptions, setProjectOptions] = useState([])
    const [sorting, setSorting] = useState('asc')

    useEffect(() => {
        getRecentProjects()
        .then(projects => {
            if(projects.data){
                const options = projects.data.map(project => ({
                    label: project.projectName,
                    value: project.projectName
                }));
                setProjectOptions([
                    {label: "Semua", value: 0},
                    ...options
                ])
            }
            else alert("Gagal memperoleh data proyek")
        })
    }, [])

    const dummyData = [
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", createdAt: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", createdAt: new Date("2024-02-11 19:59:20")}
    ]

    const [project, setProject] = useState("Semua")
    const [type, setType] = useState("Semua")
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [pageCount, setPageCount] = useState(0)
    const [historyData, setHistoryData] = useState(dummyData)
    
    const typeOptions = [
        {label: "Semua", value: 0},
        {label: "Tugas", value: 1},
        {label: "Komentar", value: 2},
        {label: "Perubahan Status", value: 3}
    ]

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    const handleProjectChange = (value) => {
        setProject(value)
        if(value === 0){
            if(type !== 0){
                setHistoryData(dummyData.filter(item => item.type === type))
            }else{
                setHistoryData(dummyData)
            }
        }else{
            setHistoryData(dummyData.filter(item => item.project === value))
        }
        setPageIndex(0)
    }
    
    const handleTypeChange = (value) => {
        setType(value)
        if(value === 0){
            if(project !== 0){
                setHistoryData(dummyData.filter(item => item.project === project))
            }else{
                setHistoryData(dummyData)
            }
        }else{
            setHistoryData(dummyData.filter(item => item.type === value))
        }
        setPageIndex(0)
    }

    useEffect(() => {
        if(historyData){
            const totalPageCount = Math.ceil(historyData.length / pageSize)
            setPageCount(totalPageCount)
        }
    }, [historyData, pageSize])

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
                <div>
                    <HistoryList
                        historyData={sortDateFn({data: historyData, sortDirection: sorting})}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        setPageIndex={setPageIndex}
                        pageCount={pageCount}
                        dataCount={historyData.length}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}