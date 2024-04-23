"use client"
import { useEffect, useState } from "react"
import { sortDateFn } from "@/app/lib/helper"

import Header from "../common/Header"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import NotificationsList from "../notifications/NotificationList"
import DashboardLayout from "../layout/DashboardLayout"

export default function Notifications(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Notifikasi", url: "/notifications"},
    ]

    const dummyData = [
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 07:20:12")},
        {type: 2, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-04-17 08:10:00")},
        {type: 3, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-01-25 22:55:15")},
        {type: 4, project: "WeTrack Beta", oldRole: "Member", newRole: "Viewer", createdAt: new Date("2023-12-31 14:14:14")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 07:20:12")},
        {type: 2, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-04-17 08:10:00")},
        {type: 3, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-01-25 22:55:15")},
        {type: 4, project: "WeTrack Beta", oldRole: "Member", newRole: "Viewer", createdAt: new Date("2023-12-31 14:14:14")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 07:20:12")},
        {type: 2, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-04-17 08:10:00")},
        {type: 3, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-01-25 22:55:15")},
        {type: 4, project: "WeTrack Beta", oldRole: "Member", newRole: "Viewer", createdAt: new Date("2023-12-31 14:14:14")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 07:20:12")},
        {type: 2, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-04-17 08:10:00")},
        {type: 3, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-01-25 22:55:15")},
        {type: 4, project: "WeTrack Beta", oldRole: "Member", newRole: "Viewer", createdAt: new Date("2023-12-31 14:14:14")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 07:20:12")},
        {type: 2, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-04-17 08:10:00")},
        {type: 3, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-01-25 22:55:15")},
        {type: 4, project: "WeTrack Beta", oldRole: "Member", newRole: "Viewer", createdAt: new Date("2023-12-31 14:14:14")},
        {type: 1, task: "Design Creation", project: "WeTrack Beta", createdAt: new Date("2024-04-18 07:20:12")},
        {type: 2, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-04-17 08:10:00")},
        {type: 3, task: "Design Creation", user: "QA Tester", project: "WeTrack Beta", createdAt: new Date("2024-01-25 22:55:15")},
        {type: 4, project: "WeTrack Beta", oldRole: "Member", newRole: "Viewer", createdAt: new Date("2023-12-31 14:14:14")}
    ]

    const [type, setType] = useState("Semua")
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [pageCount, setPageCount] = useState(0)
    const [notificationsData, setNotificationsData] = useState(dummyData)
    const [sorting, setSorting] = useState('asc')

    useEffect(() => {
        const totalPageCount = Math.ceil(notificationsData.length / pageSize)
        setPageCount(totalPageCount)
    }, [notificationsData, pageSize])

    const typeOptions = [
        {label: "Semua", value: 0},
        {label: "Penugasan", value: 1},
        {label: "Komentar Baru", value: 2},
        {label: "Penyebutan", value: 3},
        {label: "Perubahan Peran", value: 4}
    ]

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    const handleTypeChange = (value) => {
        setType(value)
        if(value === 0){
            setNotificationsData(dummyData)
        }else{
            setNotificationsData({
                data: dummyData.filter(item => item.type === value)
            })
        }
        setPageIndex(0)
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
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="w-full flex justify-between items-center gap-3 md:gap-6">
                        <div className="flex items-center gap-2 md:gap-4">
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
                    <NotificationsList
                        notificationsData={sortDateFn({data: notificationsData, sortDirection: sorting})}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        setPageIndex={setPageIndex}
                        pageCount={pageCount}
                        dataCount={notificationsData.length}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}