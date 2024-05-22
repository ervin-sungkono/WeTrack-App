import {
    MdKeyboardArrowLeft as ArrowLeft,
    MdKeyboardArrowRight as ArrowRight
} from "react-icons/md"

export default function TaskListPagination({ 
    startIndex,
    endIndex,
    dataLength,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
}){
    return(
        <div className="w-full flex justify-between items-center">
            <button className="p-1 hover:bg-gray-300 disabled:text-gray-400 rounded disabled:pointer-events-none transition-colors" onClick={prevPage} disabled={!hasPrevPage}>
                <ArrowLeft size={24}/>
            </button>
            <p className="text-xs md:text-sm">{startIndex}-{endIndex} dari {dataLength}</p>
            <button className="p-1 hover:bg-gray-300 disabled:text-gray-400 rounded disabled:pointer-events-none transition-colors" onClick={nextPage} disabled={!hasNextPage}>
                <ArrowRight size={24}/>
            </button>
        </div>
    )
}