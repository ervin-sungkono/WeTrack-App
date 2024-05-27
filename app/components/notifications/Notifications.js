"use client"
import { useEffect, useState } from "react"
import { sortDateTimestampFn } from "@/app/lib/helper"
import { getUserNotification } from "@/app/lib/fetch/user"
import { IoFilter as FilterIcon } from "react-icons/io5"

import Header from "../common/Header"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import NotificationsList from "../notifications/NotificationList"
import DashboardLayout from "../layout/DashboardLayout"
import EmptyState from "../common/EmptyState"
import { getAllProject } from "@/app/lib/fetch/project"

export default function Notifications(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Notifikasi", url: "/notifications"},
    ]

    const [project, setProject] = useState("Semua Proyek")
    const [type, setType] = useState("Semua Jenis")
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [pageCount, setPageCount] = useState(0)
    const [notificationsData, setNotificationsData] = useState([])
    const [sorting, setSorting] = useState('desc')
    const [filterDropdown, setFilterDropdown] = useState(false)

    const [dataFetched, setDataFetched] = useState([])

    useEffect(() => {
        getUserNotification().then(res => {
            const data = res.data
            data.sort((a, b) => new Date(b.createdAt.seconds) - new Date(a.createdAt.seconds))
            setDataFetched(data)
            setNotificationsData(data)
        }).catch(err => {
            console.error(err)
        })
    }, [])

    useEffect(() => {
        if(!notificationsData || notificationsData.length <= 0) return
        const totalPageCount = Math.ceil(notificationsData.length / pageSize)
        setPageCount(totalPageCount)
    }, [notificationsData, pageSize])

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
                    {label: "Semua Proyek", value: "Semua Proyek"},
                    ...options
                ])
            }
            else alert("Gagal memperoleh data proyek")
        })
    }, [])

    const typeOptions = [
        {label: "Semua Jenis", value: "Semua Jenis"},
        {label: "Penugasan", value: "AssignedTask"},
        {label: "Komentar Baru", value: "AddedComment"},
        {label: "Penyebutan", value: "Mention"},
        {label: "Perubahan Peran", value: "RoleChange"}
    ]

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    useEffect(() => {
        let filteredData = dataFetched;
        if(project !== "Semua Proyek"){
            filteredData = filteredData.filter(item => item.project?.projectName === project);
        }
        if(type !== "Semua Jenis"){
            filteredData = filteredData.filter(item => item.type === type);
        }
        setNotificationsData(filteredData);
        setPageIndex(0);
    }, [dataFetched, project, type]);

    const handleProjectChange = (value) => {
        setProject(value)
    }

    const handleTypeChange = (value) => {
        setType(value)
    }

    const handlePageSizeChange = (value) => {
        setPageSize(value)
        setPageIndex(0)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4">
                <Header title={"Notifikasi"} links={links}/>
            </div>
            <div className="h-full flex flex-col mt-4 md:mt-6 gap-4">
                {notificationsData && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <div className="w-full flex justify-between items-center gap-3 md:gap-6 z-almostFixed">
                            <div className="relative">
                                <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
                                    <FilterIcon size={20}/>
                                </button>
                                <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 left-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
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
                            </div>
                            <SortButton sorting={sorting} setSorting={setSorting}/>
                        </div>
                    </div>
                )}
                {notificationsData && notificationsData.length > 0 ? 
                    <NotificationsList
                        notificationsData={sortDateTimestampFn({data: notificationsData, sortDirection: sorting})}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        setPageIndex={setPageIndex}
                        pageCount={pageCount}
                        dataCount={notificationsData.length}
                    /> :
                    <EmptyState message="Belum ada data notifikasi yang tersedia."/>
                }
            </div>
        </DashboardLayout>
    )
}