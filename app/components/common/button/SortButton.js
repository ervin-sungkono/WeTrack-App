import { useState } from "react";
import { FaSortAmountUpAlt as SortUp, FaSortAmountDown as SortDown } from "react-icons/fa";

export default function SortButton({sortDirection = "desc", data, setData}){
    const [sort, setSort] = useState(sortDirection)

    const sortDescending = () => {
        const sortedData = data.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        )
        setData(sortedData)
        setSort("desc")
    }

    const sortAscending = () => {
        const sortedData = data.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        )
        setData(sortedData)
        setSort("asc")
    }

    return (
        <div className="cursor-pointer hover:text-basic-blue transition-colors duration-300">
            {sort === "asc" ?
                <div className="flex items-center justify-end gap-2" onClick={sortDescending}>
                    <p className="text-xs md:text-sm">Terlama</p>
                    <SortUp />
                </div> 
            :
                <div className="flex items-center justify-end gap-2" onClick={sortAscending}>
                    <p className="text-xs md:text-sm">Terbaru</p>
                    <SortDown />
                </div>
            }
        </div>
    )
}