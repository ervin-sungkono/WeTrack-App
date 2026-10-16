"use client"

import NotificationsItem from "./NotificationItem"
import NotificationPagination from "./NotificationPagination"
import type { NotificationRow } from "../types"

interface NotificationListProps {
    notificationsData: NotificationRow[]
    pageSize: number
    pageIndex: number
    setPageIndex: (index: number) => void
    pageCount: number
    dataCount: number
}

export default function NotificationsList({ notificationsData, pageSize, pageIndex, setPageIndex, pageCount, dataCount }: NotificationListProps) {
    return (
        <div className="h-full overflow-y-auto flex flex-col justify-between">
            <div className="h-full overflow-y-auto flex flex-col gap-2 md:gap-4 mb-auto pr-2 custom-scrollbar">
                {notificationsData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((item) => (
                    <NotificationsItem key={item.id} {...item} />
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
                    lastPage={() => setPageIndex(Math.max(0, pageCount - 1))}
                    dataCount={dataCount}
                />
            </div>
        </div>
    )
}
