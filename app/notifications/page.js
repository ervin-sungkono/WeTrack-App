"use client"
import { useState } from "react"
import Header from "../components/common/Header"
import SelectButton from "../components/common/button/SelectButton"
import SortButton from "../components/common/button/SortButton"
import NotificationsLayout from "../components/layout/NotificationsLayout"
import NotificationsList from "../components/notifications/NotificationList"

export default function NotificationsPage(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Notifikasi", url: "/notifications"},
    ]

    const [type, setType] = useState("Semua")
    const [pageSize, setPageSize] = useState(10)
    const [notificationsData, setNotificationsData] = useState(null)

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

    const handleTypeChange = (value) => {
        setType(value)
    }

    const handlePageSizeChange = (value) => {
        setPageSize(value)
    }

    return (
        <NotificationsLayout>
            <div className="flex flex-col gap-4">
                <Header title={"Notifikasi"} links={links}/>
            </div>
            <div className="h-full flex flex-col mt-4 md:mt-6 gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="w-full flex justify-center md:justify-between items-center gap-3 md:gap-6">
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
                        <SortButton />
                    </div>
                </div>
                <div>
                    <NotificationsList
                        data={notificationsData}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        </NotificationsLayout>
    )
}