"use client"
import { useEffect, useState } from "react"
import Header from "../common/Header"
import SelectButton from "../common/button/SelectButton"
import HistoryLayout from "../layout/HistoryLayout"
import SortButton from "../common/button/SortButton"
import HistoryList from "../history/HistoryList"
import { useSession } from "next-auth/react"
import { getRecentProjects } from "@/app/lib/fetch/project"
import SkeletonText from "../skeleton/SkeletonText"

export default function History(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Riwayat", url: "/history"},
    ]

    const { data: session, status } = useSession()
    const [projectOptions, setProjectOptions] = useState([])

    useEffect(() => {
        if(session){
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
        }
    }, [session])

    const dummyData = [
        {type: 1, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "WeTrack Beta", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "WeTrack Beta", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")},
        {type: 1, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-18 14:20:20")},
        {type: 2, task: "Design Creation", project: "Test Project", timestamp: new Date("2024-04-17 11:15:00")},
        {type: 3, task: "Design Creation", project: "Test Project", oldStatus: "TO DO", newStatus: "IN PROGRESS", timestamp: new Date("2024-02-11 19:59:20")}
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
                setHistoryData({
                    data: dummyData.data.filter(item => item.type === type)
                })
            }else{
                setHistoryData(dummyData)
            }
        }else{
            setHistoryData({
                data: historyData.data.filter(item => item.project === value)
            })
        }
        setPageIndex(0)
    }
    
    const handleTypeChange = (value) => {
        setType(value)
        if(value === 0){
            if(project !== 0){
                setHistoryData({
                    data: dummyData.data.filter(item => item.project === project)
                })
            }else{
                setHistoryData(dummyData)
            }
        }else{
            setHistoryData({
                data: historyData.data.filter(item => item.type === value)
            })
        }
        setPageIndex(0)
    }

    useEffect(() => {
        if(historyData.data){
            const totalPageCount = Math.ceil(historyData.data.length / pageSize)
            setPageCount(totalPageCount)
        }
    }, [historyData, pageSize])

    const handlePageSizeChange = (value) => {
        setPageSize(value)
        setPageIndex(0)
    }

    if(status == 'loading'){
        return (
            <div className="w-full flex items-center gap-12">
                <SkeletonText width={150} height={32} rounded/>
                <div className="hidden md:block ml-auto">
                    <SkeletonText width={160} height={40} rounded/>
                </div>
            </div>
        )
    }else{
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
                            {historyData.data && (
                                <SortButton data={historyData} setData={setHistoryData}/>
                            )}
                        </div>
                    </div>
                    <div>
                        <HistoryList
                            historyData={historyData}
                            pageSize={pageSize}
                            pageIndex={pageIndex}
                            setPageIndex={setPageIndex}
                            pageCount={pageCount}
                            dataCount={historyData.data.length}
                        />
                    </div>
                </div>
            </HistoryLayout>
        )
    }
}