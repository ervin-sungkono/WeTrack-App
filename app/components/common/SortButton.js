import { useState } from "react";
import { FaSortAmountUpAlt as SortUp, FaSortAmountDown as SortDown } from "react-icons/fa";

export default function SortButton({sortDirection = "asc"}){
    const [sort, setSort] = useState(sortDirection)

    return (
        <div className="cursor-pointer">
            {sort === "asc" ?
                <div className="flex items-center justify-end gap-2" onClick={() => setSort("desc")}>
                    Terlama
                    <SortUp />
                </div> 
            :
                <div className="flex items-center justify-end gap-2" onClick={() => setSort("asc")}>
                    Terbaru
                    <SortDown />
                </div>
            }
        </div>
    )
}