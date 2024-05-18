"use client"
import { useEffect, useState } from "react"

import TaskItem from "./TaskItem"
import SelectButton from "../common/button/SelectButton"
import SortButton from "../common/button/SortButton"
import TaskListPagination from "./TaskListPagination"
import Button from "../common/button/Button"
import { sortDateFn, sortValueFn } from "@/app/lib/helper"

export default function TaskList({ tasks, taskId }){
    const [sortField, setSortField] = useState("createdAt")
    const [sortDirection, setSortDirection] = useState("asc")
    const [sortedTasks, setSortedTask] = useState([])
    const [pageIndex, setPageIndex] = useState(0)
    const [taskListVisibility, setTaskListVisible] = useState(false)
    const PAGE_SIZE = 10
    const PAGE_COUNT = Math.ceil(tasks.length / PAGE_SIZE)

    const startIndex = (pageIndex * PAGE_SIZE) + 1
    const endIndex = Math.min((pageIndex + 1) * PAGE_SIZE, tasks.length)

    useEffect(() => {
        if(sortField === 'createdAt'){ 
            const sortedTask = sortDateFn({ data: tasks, sortDirection, key: sortField })
            setSortedTask(sortedTask)
        }
        else {
            const sortedTask = sortValueFn({ data: tasks, sortDirection, key: sortField })
            setSortedTask(sortedTask)
        }
    }, [sortField, sortDirection, tasks])

    return(
        <div className="w-full sm:w-[228px] md:w-[260px] sm:h-full relative flex-shrink-0 sm:overflow-hidden">
            <Button 
                variant="secondary" 
                className="w-full flex justify-center sm:hidden text-xs md:text-sm" 
                onClick={() => setTaskListVisible(!taskListVisibility)}>
                Lihat Daftar Tugas
            </Button>
            <div className={`${taskListVisibility ? "flex" : "hidden sm:flex"} absolute top-10 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:static w-full h-64 sm:h-full bg-gray-200 rounded-md flex-col gap-2 p-2.5 z-50 sm:z-0`}>
                <div className="flex items-center">
                    <div className="flex flex-grow items-center gap-2">
                        <p className="text-xs md:text-sm font-semibold">Sort By</p>
                        <SelectButton
                            name={"sort-button"}
                            options={[
                                {label: "Created At", value: "createdAt"},
                                {label: "Priority", value: "priority"}
                            ]}
                            onChange={(value) => setSortField(value)}
                        />
                    </div>
                    <SortButton hideLabel sorting={sortDirection} setSorting={setSortDirection}/>
                </div>
                <div className="h-full overflow-y-auto flex flex-col gap-1 custom-scrollbar pr-2 -mr-2">
                    {sortedTasks.slice((startIndex - 1), endIndex).map(task => (
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
        </div>
    )
}