"use client"
import { useEffect, useState } from "react"
import { sortDateTimestampFn } from "@/app/lib/helper"
import { getUserNotification } from "@/app/lib/fetch/user"

import Header from "../common/Header"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import NotificationsList from "../notifications/NotificationList"
import DashboardLayout from "../layout/DashboardLayout"
import EmptyState from "../common/EmptyState"

export default function Notifications(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Notifikasi", url: "/notifications"},
    ]

    const [type, setType] = useState("Semua")
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [pageCount, setPageCount] = useState(0)
    const [notificationsData, setNotificationsData] = useState([])
    const [sorting, setSorting] = useState('desc')

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

    const typeOptions = [
        {label: "Semua", value: 0},
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

    const handleTypeChange = (value) => {
        setType(value)
        if(value === 0){
            setNotificationsData(dataFetched)
        }else{
            setNotificationsData(dataFetched.filter(item => item.type === value))
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
                {notificationsData && notificationsData.length > 0 && (
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
                    <EmptyState message={"Belum ada data notifikasi yang tersedia."}/>
                }
            </div>
        </DashboardLayout>
    )
}