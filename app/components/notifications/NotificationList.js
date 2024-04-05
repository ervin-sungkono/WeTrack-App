"use client"
import NotificationsItem from "./NotificationItem"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import NotificationPagination from "./NotificationPagination"
import { useEffect, useMemo } from "react"

export default function NotificationsList({notificationsData, pageSize=10}){

    const memoizedData = useMemo(() => notificationsData, [notificationsData])

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
        data: memoizedData,
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
            <NotificationsItem type={"taskAssignment"} task={"Design Creation"} project={"WeTrack Beta"} timestamp={"15 menit yang lalu"}/>
            <NotificationsItem type={"newComment"} task={"Design Creation"} user={"QA Tester"} project={"WeTrack Beta"} timestamp={"2 jam yang lalu"}/>
            <NotificationsItem type={"commentMention"} task={"Design Creation"} user={"QA Tester"} project={"WeTrack Beta"} timestamp={"2 jam yang lalu"}/>
            <NotificationsItem type={"projectRoleChange"} project={"WeTrack Beta"} oldRole={"Member"} newRole={"Viewer"} timestamp={"1 hari yang lalu"}/>
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