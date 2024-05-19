"use client"

import SearchBar from "../../common/SearchBar";
import { useEffect, useState } from "react";
import SelectButton from "../../common/button/SelectButton";
import { IoFilter as FilterIcon } from "react-icons/io5"
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { useRole } from "@/app/lib/context/role";
import { getDocumentReference, getQueryReference, getQueryReferenceOrderBy } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import { validateUserRole } from "@/app/lib/helper";

export default function TimelineContent({ projectId }){
    const role = useRole()

    const [query, setQuery] = useState("")
    const [labelsData, setLabelsData] = useState([])
    const [assigneesData, setAssigneesData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [filterDropdown, setFilterDropdown] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    const [tasks, setTasks] = useState([
        // {
        //     start: new Date(2023, 11, 19),
        //     end: new Date(2024, 0, 12),
        //     name: 'Timeline Page',
        //     id: 'TimelinePage',
        //     type: 'project',
        //     progress: 75,
        //     hideChildren: false,
        //     displayOrder: 1,
        //     styles: { progressColor: '#4CAF50', backgroundColor: '#47389F' },
        // },
        // {
        //     start: new Date(2023, 11, 19),
        //     end: new Date(2024, 0, 2),
        //     name: 'UI Design',
        //     id: 'KAN-2',
        //     type: 'task',
        //     project: 'TimelinePage',
        //     progress: 75,
        //     displayOrder: 2,
        //     styles: { progressColor: '#47389F', backgroundColor: '#000000' },
        // },
        // {
        //     start: new Date(2023, 11, 26),
        //     end: new Date(2024, 0, 5),
        //     name: 'Front End',
        //     id: 'KAN-4',
        //     type: 'task',
        //     project: 'TimelinePage',
        //     progress: 50,
        //     displayOrder: 3,
        //     styles: { progressColor: '#47389F', backgroundColor: '#000000' },
        // },
        // {
        //     start: new Date(2024, 0, 3),
        //     end: new Date(2024, 0, 12),
        //     name: 'Back End',
        //     id: 'KAN-5',
        //     type: 'task',
        //     project: 'TimelinePage',
        //     progress: 25,
        //     displayOrder: 4,
        //     styles: { progressColor: '#47389F', backgroundColor: '#000000' },
        // },
    ]);

    useEffect(() => {
        if(!projectId) return
        const labelReference = getQueryReference({collectionName: "labels", field: "projectId", id: projectId})
        const labelUnsubscribe = onSnapshot(labelReference, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                const label = doc.data()
                return {
                    label: label.content,
                    value: label.content
                }
            })
            setLabelsData(data)
        })
        const assigneeReference = getQueryReference({ collectionName: "teams", field: "projectId", id: projectId });
        const assigneeUnsubscribe = onSnapshot(assigneeReference, (snapshot) => {
            const fetchAssignees = async () => {
                const data = await Promise.all(snapshot.docs.map(async (document) => {
                    const userReference = getDocumentReference({ collectionName: "users", id: document.data().userId });
                    const userSnapshot = await getDoc(userReference);
                    const userData = userSnapshot.data();
                    return {
                        label: userData.fullName,
                        value: userData.fullName
                    };
                }));
                setAssigneesData(data);
            };
            fetchAssignees();
        });
        const statusReference = getQueryReference({collectionName: "status", field: "projectId", id: projectId})
        const statusUnsubscribe = onSnapshot(statusReference, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                const status = doc.data()
                return {
                    label: status.statusName,
                    value: status.statusName
                }
            })
            setStatusData(data)
        })

        return () => {
            labelUnsubscribe()
            assigneeUnsubscribe()
            statusUnsubscribe()
        }
    }, [projectId])

    useEffect(() => {
        if(!projectId) return
        const reference = getQueryReferenceOrderBy({collectionName: "tasks", field: "projectId", id: projectId, orderByKey:"order"})
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const data = await Promise.all(snapshot.docs.map(async(document) => {
                const taskData = document.data()
                const task = {
                    id: document.id,
                    ...taskData
                }
                return task
            }))
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            const filteredData = data.filter((task) => (task.startDate !== null && task.dueDate !== null) && task.taskName.toLowerCase().includes(query));
            const formattedTasks = filteredData.map(task => {
                const [startYear, startMonth, startDay] = task.startDate.split('-');
                const [endYear, endMonth, endDay] = task.dueDate.split('-');
                return {
                    start: new Date(startYear, startMonth - 1, startDay),
                    end: new Date(endYear, endMonth - 1, endDay),
                    name: task.taskName,
                    id: task.id,
                    type: task.type === "Task" ? "project" : "task",
                    displayOrder: task.order,
                    styles: { progressColor: '#000000', backgroundColor: '#47389F' }
                };
            });
            setTasks(formattedTasks);
        })
        return () => unsubscribe()
    }, [projectId, query])

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

    return (
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
                {tasks && tasks.length > 0 ? (
                    <>
                        {validateUserRole({ userRole: role, minimumRole: 'Owner' }) ? (
                            <Gantt
                                tasks={tasks}
                                viewMode={ViewMode.Day}
                                locale={'id-ID'}
                                onDateChange={handleTaskDateChange}
                                onExpanderClick={handleExpanderClick}
                            />
                        ) : (
                            <Gantt
                                tasks={tasks}
                                viewMode={ViewMode.Day}
                                locale={'id-ID'}
                            />
                        )}
                    </>
                    
                ) : (
                    <div className="text-dark-blue text-center text-sm md:text-base">
                        Belum ada data tugas yang tersedia.
                    </div>
                )}
            </div>
        </div>
    )
}