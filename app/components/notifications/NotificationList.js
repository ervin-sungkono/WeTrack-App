"use client"
import NotificationsItem from "./NotificationItem"
import NotificationPagination from "./NotificationPagination"

export default function NotificationsList({notificationsData, pageSize, pageIndex, setPageIndex, pageCount, dataCount}){

    const shownData = notificationsData.data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)

    return (
        <div className="flex flex-col gap-2 md:gap-4 mb-8">
            {shownData.map((item, index) => (
                <NotificationsItem key={index} {...item}/>
            ))}
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
    )
}