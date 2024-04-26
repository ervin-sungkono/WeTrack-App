"use client"
import { useState } from "react"

import TaskItem from "./TaskItem"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"

export default function TaskList({ tasks }){
    const [sortField, setSortField] = useState("Created")
    const [sortDirection, setSortDirection] = useState("asc")

    return(
        <div className="w-[260px] h-full bg-gray-200 rounded-md flex flex-shrink-0 flex-col gap-2 p-2.5 overflow-y-auto">
            <div className="flex items-center">
                <div className="flex flex-grow items-center gap-2">
                    <p className="text-xs md:text-sm font-semibold">Sort By</p>
                    <SelectButton
                        name={"sort-button"}
                        defaultValue={sortField}
                        options={[]}
                        onChange={(value) => setSortField(value)}
                    />
                </div>
                <SortButton hideLabel sorting={sortDirection} setSorting={setSortDirection}/>
            </div>
            <div className="h-full overflow-y-auto flex flex-col gap-1 custom-scrollbar pr-2 -mr-2">
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task}/>
                ))}
            </div>
            <div>
                Pagination
            </div>
        </div>
    )
}