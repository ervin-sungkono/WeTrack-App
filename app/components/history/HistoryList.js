"use client"
import HistoryItem from "./HistoryItem"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import HistoryPagination from "./HistoryPagination"
import { useEffect } from "react"

export default function HistoryList({historyData, pageSize=10}){

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
            {historyData.data.map((item, index) => (
                <HistoryItem key={index} {...item}/>
            ))}
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