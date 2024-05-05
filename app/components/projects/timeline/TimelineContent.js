"use client"

import { ProjectProvider } from "@/app/lib/context/project";
import SearchBar from "../../common/SearchBar";
import { useState } from "react";
import SelectButton from "../../common/button/SelectButton";
import { IoFilter as FilterIcon } from "react-icons/io5"
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

export default function TimelineContent(){

    const tasks = [
        {
            start: new Date(2023, 11, 19),
            end: new Date(2024, 0, 2),
            name: 'UI Design',
            id: 'KAN-2',
            type: 'task',
            progress: 75,
            isDisabled: true,
            styles: { progressColor: '#0C66E4', backgroundColor: '#000000' },
        },
        {
            start: new Date(2023, 11, 26),
            end: new Date(2024, 0, 5),
            name: 'Front End',
            id: 'KAN-4',
            type: 'task',
            progress: 50,
            isDisabled: false,
            styles: { progressColor: '#0C66E4', backgroundColor: '#000000' },
        },
        {
            start: new Date(2024, 0, 3),
            end: new Date(2024, 0, 12),
            name: 'Back End',
            id: 'KAN-5',
            type: 'task',
            progress: 25,
            isDisabled: false,
            styles: { progressColor: '#0C66E4', backgroundColor: '#000000' },
        }
    ];

    const tasksViewMode = ViewMode.Day;

    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [filterDropdown, setFilterDropdown] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    return (
        <ProjectProvider>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
                    <div className="w-full flex justify-center xs:justify-start items-center gap-3 md:gap-6">
                        <SearchBar placeholder={"Cari jadwal.."} handleSearch={handleSearch}/>
                        <div className="relative">
                            <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
                                <FilterIcon size={20}/>
                            </button>
                            <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
                                <SelectButton 
                                    name={"status-button"}
                                    placeholder={"Status"}
                                />
                                <SelectButton 
                                    name={"assignee-button"}
                                    placeholder={"Penerima"}
                                />
                                <SelectButton 
                                    name={"label-button"}
                                    placeholder={"Label"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <Gantt
                        tasks={tasks}
                        viewMode={tasksViewMode}
                        // onDateChange={onTaskChange}
                        // onTaskDelete={onTaskDelete}
                        // onProgressChange={onProgressChange}
                        // onDoubleClick={onDblClick}
                        // onClick={onClick}
                    />
                </div>
            </div>
        </ProjectProvider>
    )
}