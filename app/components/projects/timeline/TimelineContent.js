"use client"

import { ProjectProvider } from "@/app/lib/context/project";
import SearchBar from "../../common/SearchBar";
import { useState } from "react";
import SelectButton from "../../common/button/SelectButton";
import { IoFilter as FilterIcon } from "react-icons/io5"
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

export default function TimelineContent(){

    const [tasks, setTasks] = useState([
        {
            start: new Date(2023, 11, 19),
            end: new Date(2024, 0, 12),
            name: 'Timeline Page',
            id: 'TimelinePage',
            type: 'project',
            progress: 75,
            hideChildren: false,
            displayOrder: 1,
            styles: { progressColor: '#4CAF50', backgroundColor: '#47389F' },
        },
        {
            start: new Date(2023, 11, 19),
            end: new Date(2024, 0, 2),
            name: 'UI Design',
            id: 'KAN-2',
            type: 'task',
            project: 'TimelinePage',
            progress: 75,
            displayOrder: 2,
            styles: { progressColor: '#47389F', backgroundColor: '#000000' },
        },
        {
            start: new Date(2023, 11, 26),
            end: new Date(2024, 0, 5),
            name: 'Front End',
            id: 'KAN-4',
            type: 'task',
            project: 'TimelinePage',
            progress: 50,
            displayOrder: 3,
            styles: { progressColor: '#47389F', backgroundColor: '#000000' },
        },
        {
            start: new Date(2024, 0, 3),
            end: new Date(2024, 0, 12),
            name: 'Back End',
            id: 'KAN-5',
            type: 'task',
            project: 'TimelinePage',
            progress: 25,
            displayOrder: 4,
            styles: { progressColor: '#47389F', backgroundColor: '#000000' },
        },
    ]);

    const getStartEndDateForProject = (tasks, projectId) => {
        const projectTasks = tasks.filter((t) => t.project === projectId)
        let start = projectTasks[0].start
        let end = projectTasks[0].end

        for (let i = 0; i < projectTasks.length; i++) {
            const task = projectTasks[i]
            if (start.getTime() > task.start.getTime()) {
                start = task.start
            }
            if (end.getTime() < task.end.getTime()) {
                end = task.end
            }
        }
        return [start, end]
    }

    const handleExpanderClick = (task) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    };

    const handleTaskDateChange = (task) => {
        let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
        if (task.project) {
            const [start, end] = getStartEndDateForProject(newTasks, task.project);
            const project = newTasks[newTasks.findIndex((t) => t.id === task.project)];
            if (project.start.getTime() !== start.getTime() || project.end.getTime() !== end.getTime()) {
                const changedProject = { ...project, start, end };
                newTasks = newTasks.map((t) =>
                    t.id === task.project ? changedProject : t
                );
            }
        }
        setTasks(newTasks);
    };

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
                <div className="w-full">
                    <Gantt
                        tasks={tasks}
                        viewMode={ViewMode.Week}
                        locale={'id-ID'}
                        onDateChange={handleTaskDateChange}
                        onExpanderClick={handleExpanderClick}
                    />
                </div>
            </div>
        </ProjectProvider>
    )
}