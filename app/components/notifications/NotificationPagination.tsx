import {
    MdKeyboardArrowLeft as ArrowLeft,
    MdKeyboardArrowRight as ArrowRight,
    MdKeyboardDoubleArrowLeft as DoubleArrowLeft,
    MdKeyboardDoubleArrowRight as DoubleArrowRight
} from "react-icons/md"

interface NotificationPaginationProps {
    pageIndex: number
    pageSize: number
    hasPrevPage: boolean
    hasNextPage: boolean
    previousPage: () => void
    nextPage: () => void
    firstPage: () => void
    lastPage: () => void
    dataCount: number
}

export default function NotificationPagination({
    pageIndex,
    pageSize,
    hasPrevPage,
    hasNextPage,
    previousPage,
    nextPage,
    firstPage,
    lastPage,
    dataCount
}: NotificationPaginationProps){
    const startIndex = (pageIndex * pageSize) + 1
    const endIndex = Math.min((pageIndex + 1) * pageSize, dataCount)

    return(
        <div className="flex justify-center items-center">
            <div className="flex items-center">
                <button
                    className="hover:text-basic-blue p-1 disabled:text-dark-blue/60"
                    onClick={() => firstPage()}
                    disabled={!hasPrevPage}
                >
                    <DoubleArrowLeft className="text-xl md:text-2xl"/>
                </button>
                <button
                    className="hover:text-basic-blue p-1 disabled:text-dark-blue/60"
                    onClick={() =>previousPage()}
                    disabled={!hasPrevPage}
                >
                    <ArrowLeft className="text-xl md:text-2xl"/>
                </button>
            </div>
            <p className="text-xs md:text-sm px-4">{startIndex}-{endIndex} dari {dataCount}</p>
            <div className="flex items-center">
                <button
                    className="hover:text-basic-blue p-1 disabled:text-dark-blue/60"
                    onClick={() => nextPage()}
                    disabled={!hasNextPage}
                >
                    <ArrowRight className="text-xl md:text-2xl"/>
                </button>
                <button
                    className="hover:text-basic-blue p-1 disabled:text-dark-blue/60"
                    onClick={() => lastPage()}
                    disabled={!hasNextPage}
                >
                    <DoubleArrowRight className="text-xl md:text-2xl"/>
                </button>
            </div>
        </div>
    )
}
