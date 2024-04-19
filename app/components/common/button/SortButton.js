import { useState } from "react";
import { FaSortAmountUpAlt as SortUp, FaSortAmountDown as SortDown } from "react-icons/fa";

export default function SortButton({sortDirection = "desc", data, setData}){
    const [sort, setSort] = useState(sortDirection)

    const sortDescending = () => {
        const sortedData = {
            data: [...data.data].sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            )
        }
        setData(sortedData)
        setSort("desc")
    }

    const sortAscending = () => {
        const sortedData = {
            data: [...data.data].sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            )
        }
        setData(sortedData)
        setSort("asc")
    }

    return (
        <div className="cursor-pointer">
            {sort === "asc" ?
                <div className="flex items-center justify-end gap-2" onClick={sortDescending}>
                    Terlama
                    <SortUp />
                </div> 
            :
                <div className="flex items-center justify-end gap-2" onClick={sortAscending}>
                    Terbaru
                    <SortDown />
                </div>
            }
        </div>
    )
}