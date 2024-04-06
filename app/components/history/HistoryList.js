"use client"
import HistoryItem from "./HistoryItem"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import HistoryPagination from "./HistoryPagination"
import { useEffect, useMemo } from "react"

export default function HistoryList({historyData, pageSize=10}){

    const memoizedData = useMemo(() => historyData, [historyData])

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
            <HistoryItem type={"taskCreation"} task={"Design Creation"} project={"WeTrack Beta"} timestamp={"15 menit yang lalu"} />
            <HistoryItem type={"commentCreation"} task={"Design Creation"} project={"WeTrack Beta"} timestamp={"5 jam yang lalu"} />
            <HistoryItem type={"taskStatusUpdate"} task={"Design Creation"} project={"WeTrack Beta"} oldStatus={"TO DO"} newStatus={"IN PROGRESS"} timestamp={"1 hari yang lalu"} />
            {/* <HistoryPagination
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