"use client"

import HistoryItem from "./HistoryItem"
import HistoryPagination from "./HistoryPagination"
import type { HistoryRow } from "../types"

interface HistoryListProps {
    historyData: HistoryRow[]
    pageSize: number
    pageIndex: number
    setPageIndex: (index: number) => void
    pageCount: number
    dataCount: number
}

export default function HistoryList({ historyData, pageSize, pageIndex, setPageIndex, pageCount, dataCount }: HistoryListProps) {
    return (
        <div className="h-full overflow-y-auto flex flex-col justify-between">
            <div className="h-full overflow-y-auto flex flex-col gap-2 md:gap-4 mb-auto pr-2 custom-scrollbar">
                {historyData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((item) => (
                    <HistoryItem key={item.id} {...item} />
                ))}
            </div>
            <div className="mt-4 md:mt-6">
                <HistoryPagination
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    hasPrevPage={pageIndex > 0}
                    hasNextPage={pageIndex < pageCount - 1}
                    nextPage={() => setPageIndex(pageIndex + 1)}
                    previousPage={() => setPageIndex(pageIndex - 1)}
                    firstPage={() => setPageIndex(0)}
                    lastPage={() => setPageIndex(Math.max(0, pageCount - 1))}
                    dataCount={dataCount}
                />
            </div>
        </div>
    )
}
