import { IoIosArrowDown as DropdownIcon } from "react-icons/io";

export default function DashboardProjectItem({project}){
    return (
        <div className="bg-white px-1 md:px-2 py-2 md:py-4 flex justify-between items-center rounded-lg">
            <div className="text-sm md:text-md font-semibold">
                {project.name} ({project.amount})
            </div>
            <div className="cursor-pointer">
                <DropdownIcon size={24}/>
            </div>
        </div>
    )
}