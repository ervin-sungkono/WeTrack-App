"use client"
import HistoryItem from "./HistoryItem"
import HistoryPagination from "./HistoryPagination"

export default function HistoryList({historyData, pageSize, pageIndex, setPageIndex, pageCount, dataCount}){

    let shownData

    if(historyData.length <= 0){
        return (
            <div className="text-center">
                Tidak ada data riwayat yang tersedia.
            </div>
        )
    }else{
        shownData = historyData.data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        return (
            <div className="flex flex-col gap-2 md:gap-4 mb-8">
                {shownData.map((item, index) => (
                    <HistoryItem key={index} {...item}/>
                ))}
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
        )
    }
}