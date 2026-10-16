import {
    FaSortAmountUpAlt as SortUp,
    FaSortAmountDown as SortDown
} from "react-icons/fa";

type SortButtonProps = {
    hideLabel?: boolean
    sorting?: "asc" | "desc"
    setSorting: (sorting: "asc" | "desc") => void
}

export default function SortButton({hideLabel = false, sorting = 'asc', setSorting}: SortButtonProps){
    return (
        <div className="cursor-pointer hover:text-basic-blue transition-colors duration-300">
            <div className="flex items-center justify-end gap-2" onClick={() => setSorting(sorting === 'asc' ? 'desc': 'asc')}>
                {!hideLabel && <p className="text-xs md:text-sm">{sorting === 'asc' ? "Terlama": "Terbaru"}</p>}
                {sorting === 'asc' ? <SortUp /> : sorting === 'desc' ? <SortDown /> : null}
            </div>
        </div>
    )
}
