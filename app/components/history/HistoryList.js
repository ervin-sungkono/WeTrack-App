"use client"
import HistoryItem from "./HistoryItem"
import HistoryPagination from "./HistoryPagination"

export default function HistoryList({historyData, pageSize, pageIndex, setPageIndex, pageCount, dataCount}){
    return (
        <div className="h-full overflow-y-auto flex flex-col justify-between">
            <div className="h-full overflow-y-auto flex flex-col gap-2 md:gap-4 mb-auto pr-2 custom-scrollbar">
                {historyData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((item, index) => (
                    <HistoryItem key={index} {...item} />
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
                    lastPage={() => setPageIndex(pageCount - 1)}
                    pageCount={pageCount}
                    dataCount={dataCount}
                />
            </div>
        </div>
    )
}