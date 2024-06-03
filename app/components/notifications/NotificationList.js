"use client"
import NotificationsItem from "./NotificationItem"
import NotificationPagination from "./NotificationPagination"

export default function NotificationsList({notificationsData, pageSize, pageIndex, setPageIndex, pageCount, dataCount}){
    return (
        <div className="h-full overflow-y-auto flex flex-col justify-between min-h-screen">
            <div className="h-full overflow-y-auto flex flex-col gap-2 md:gap-4 mb-auto custom-scrollbar">
                {notificationsData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((item, index) => (
                    <NotificationsItem key={index} {...item}/>
                ))}
            </div>
            <div className="mt-4 md:mt-6">
                <NotificationPagination
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