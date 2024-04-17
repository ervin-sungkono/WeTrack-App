"use client"
import NotificationsItem from "./NotificationItem"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import NotificationPagination from "./NotificationPagination"
import { useEffect } from "react"

export default function NotificationsList({notificationsData, pageSize=10}){

    const { 
        getState,
        nextPage,
        previousPage,
        getPageCount,
        getCanPreviousPage,
        getCanNextPage, 
        setPageSize,
        setPageIndex
    } = useReactTable({
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    useEffect(() => {
        if(setPageSize){
            setPageSize(pageSize)
        }
    }, [setPageSize, pageSize])

    return (
        <div className="flex flex-col gap-2 md:gap-4">
            {notificationsData.data.map((item, index) => (
                <NotificationsItem key={index} {...item}/>
            ))}
            {/* <NotificationPagination
                {...getState().pagination}
                hasPrevPage={getCanPreviousPage()}
                hasNextPage={getCanNextPage()}
                nextPage={nextPage}
                previousPage={previousPage}
                firstPage={() => setPageIndex(0)}
                lastPage={() => setPageIndex(getPageCount() - 1)}
                totalCount={data.length}
            /> */}
        </div>
    )
}