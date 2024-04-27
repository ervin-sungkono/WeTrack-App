"use client"
import { useState } from "react"

import TaskItem from "./TaskItem"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import TaskListPagination from "./TaskListPagination"

export default function TaskList({ tasks, taskId }){
    const [sortField, setSortField] = useState("Created")
    const [sortDirection, setSortDirection] = useState("asc")
    const [pageIndex, setPageIndex] = useState(0)
    const PAGE_SIZE = 10
    const PAGE_COUNT = Math.ceil(tasks.length / PAGE_SIZE)

    const startIndex = (pageIndex * PAGE_SIZE) + 1
    const endIndex = Math.min((pageIndex + 1) * PAGE_SIZE, tasks.length)

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
                {tasks.slice((startIndex - 1), endIndex).map(task => (
                    <TaskItem key={task.id} task={task} active={taskId === task.id}/>
                ))}
            </div>
            <TaskListPagination 
                startIndex={startIndex}
                endIndex={endIndex}
                dataLength={tasks.length}
                nextPage={() => setPageIndex(pageIndex + 1)}
                prevPage={() => setPageIndex(pageIndex - 1)}
                hasNextPage={pageIndex + 1 < PAGE_COUNT}
                hasPrevPage={pageIndex > 0}
            />
        </div>
    )
}