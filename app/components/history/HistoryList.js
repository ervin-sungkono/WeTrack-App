"use client"
import HistoryItem from "./HistoryItem"
import HistoryPagination from "./HistoryPagination"

export default function HistoryList({historyData, pageSize, pageIndex, setPageIndex, pageCount, dataCount}){
    return (
        <div className="flex flex-col justify-between min-h-screen">
            <div className="flex flex-col gap-2 md:gap-4 mb-auto">
                {historyData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((item, index) => (
                    <HistoryItem key={index} {...item} />
                ))}
            </div>
            <div className="mt-8">
                <HistoryPagination
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    hasPrevPage={pageIndex > 0}
                    hasNextPage={pageIndex < pageCount - 1}
                    nextPage={() => setPageIndex(pageIndex + 1)}
                    previousPage={() => setPageIndex(pageIndex - 1)}
                    firstPage={() => setPageIndex(0)}
                    lastPage={() => setPageIndex(pageCount - 1)}
                    pageCount={pageCount}
                    dataCount={dataCount}
                />
            </div>
        </div>
    )
}