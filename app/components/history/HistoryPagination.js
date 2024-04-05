import {
    MdKeyboardArrowLeft as ArrowLeft,
    MdKeyboardArrowRight as ArrowRight,
    MdKeyboardDoubleArrowLeft as DoubleArrowLeft,
    MdKeyboardDoubleArrowRight as DoubleArrowRight
} from "react-icons/md"

export default function HistoryPagination({ 
    pageIndex, 
    pageSize, 
    hasPrevPage, 
    hasNextPage, 
    previousPage,
    nextPage,
    firstPage,
    lastPage,
    totalCount 
}){
    const startIndex = (pageIndex * pageSize) + 1
    const endIndex = Math.min((pageIndex + 1) * pageSize, totalCount)

    return(
        <div className="flex justify-center items-center mt-auto">
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
            <p className="text-xs md:text-sm px-4">{startIndex} to {endIndex} of {totalCount}</p>
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