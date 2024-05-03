"use client"
import { useEffect, useState } from "react"

import TaskDetail from "../projects/task/TaskDetail"
import TaskList from "./TaskList"
import SearchBar from "../common/SearchBar"
import SelectButton from "../common/button/SelectButton"

import { IoFilter as FilterIcon } from "react-icons/io5"
import { getAllTask } from "@/app/lib/fetch/task"

export default function TaskContent({ projectId, taskId }){
    const [query, setQuery] = useState("")
    const [filterDropdown, setFilterDropdown] = useState(false)
    const [tasks, setTasks] = useState([])
    const [taskData, setTaskData] = useState()

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    useEffect(() => {
        if(projectId){
            getAllTask(projectId)
                .then(res => {
                    if(res.data){
                        setTasks(res.data)
                        if(!taskId){
                            setTaskData(res.data[0])
                        }
                    }
                    else{
                        alert("Gagal mengambil data tugas")
                    }
                })
        }
    }, [projectId, taskId])

    return(
        <div className="w-full h-full flex flex-col gap-2.5 sm:gap-4 overflow-y-auto">
            <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
                <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6"> 
                    <SearchBar placeholder={"Cari tugas.."} handleSearch={handleSearch}/>
                    <div className="relative">
                        <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
                        <FilterIcon size={20}/>
                        </button>
                        <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
                        <SelectButton 
                            name={"assignee-button"}
                            placeholder={"Penerima"}
                        />
                        <SelectButton 
                            name={"task-status-button"}
                            placeholder={"Status"}
                        />
                        <SelectButton 
                            name={"label-button"}
                            placeholder={"Label"}
                        />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-full flex flex-col sm:flex-row gap-2 sm:gap-4 overflow-hidden sm:overflow-y-auto">
                <TaskList tasks={tasks} taskId={taskId}/>
                <TaskDetail taskId={taskId} taskData={taskData}/>
            </div>
        </div>
    )
}