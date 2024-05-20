"use client"

import SearchBar from "../../common/SearchBar";
import { useEffect, useState } from "react";
import SelectButton from "../../common/button/SelectButton";
import { IoFilter as FilterIcon } from "react-icons/io5"
import { useRole } from "@/app/lib/context/role";
import { getDocumentReference, getQueryReference, getQueryReferenceOrderBy } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";

export default function TimelineContent({ projectId }){
    const role = useRole()
    const [query, setQuery] = useState("")
    const [labelsData, setLabelsData] = useState([])
    const [assigneesData, setAssigneesData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [label, setLabel] = useState("Label")
    const [assignee, setAssignee] = useState("Penerima")
    const [status, setStatus] = useState("Status")
    const [filterDropdown, setFilterDropdown] = useState(false)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    const [taskData, setTaskData] = useState([])
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
            setLabelsData([
                {label: "Semua", value: "Label"},
                ...data
            ])
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
                setAssigneesData([
                    { label: "Semua", value: "Penerima" },
                    ...data
                ]);
            };
            fetchAssignees();
        });
        const statusReference = getQueryReferenceOrderBy({collectionName: "taskStatuses", field: "projectId", id: projectId, orderByKey: "order"})
        const statusUnsubscribe = onSnapshot(statusReference, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                const status = doc.data()
                return {
                    label: status.statusName,
                    value: status.statusName
                }
            })
            setStatusData([
                {label: "Semua", value: "Status"},
                ...data
            ])
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
            setTaskData(filteredData)
            const formattedTasks = filteredData.map(task => {
                const [startYear, startMonth, startDay] = task.startDate.split('-');
                const [endYear, endMonth, endDay] = task.dueDate.split('-');
            });
            setTasks(formattedTasks);
        })
        return () => unsubscribe()
    }, [projectId, query])

    const handleStatusChange = (value) => {
        setStatus(value)
        if(value === "Status"){
            if(label === "Label" && assignee === "Penerima"){
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }else{
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && (task.label === label || label === "Label") && (task.assignee === assignee || assignee === "Penerima"));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }
        }else{
            if(label === "Label" && assignee === "Penerima"){
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && task.status === value);
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }else{
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && task.status === value && (task.label === label || label === "Label") && (task.assignee === assignee || assignee === "Penerima"));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }
        }
    }

    const handleAssigneeChange = (value) => {
        setAssignee(value)
        if(value === "Penerima"){
            if(label === "Label" && status === "Status"){
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }else{
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && (task.label === label || label === "Label") && (task.status === status || status === "Status"));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }
        }else{
            if(label === "Label" && status === "Status"){
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && task.assignee === value);
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }else{
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && task.assignee === value && (task.label === label || label === "Label") && (task.status === status || status === "Status"));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }
        }
    }

    const handleLabelChange = (value) => {
        setLabel(value)
        if(value === "Label"){
            if(assignee === "Penerima" && status === "Status"){
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }else{
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && (task.assignee === assignee || assignee === "Penerima") && (task.status === status || status === "Status"));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }
        }else{
            if(assignee === "Penerima" && status === "Status"){
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && task.assignee === value);
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }else{
                const filteredData = taskData.filter((task) => task.taskName.toLowerCase().includes(query) && task.assignee === value && (task.assignee === assignee || assignee === "Penerima") && (task.status === status || status === "Status"));
                const formattedTasks = filteredData.map(task => {
                    const [startYear, startMonth, startDay] = task.startDate.split('-');
                    const [endYear, endMonth, endDay] = task.dueDate.split('-');
                });
                setTasks(formattedTasks);
            }
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
                <div className="w-full flex justify-center xs:justify-start items-center gap-3 md:gap-6">
                    <SearchBar placeholder={"Cari jadwal.."} handleSearch={handleSearch}/>
                    <div className="relative">
                        <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
                            <FilterIcon size={20}/>
                        </button>
                        <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-fixed absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
                            <SelectButton 
                                name={"status-button"}
                                placeholder={status}
                                options={statusData}
                                onChange={handleStatusChange}
                            />
                            <SelectButton 
                                name={"assignee-button"}
                                placeholder={assignee}
                                options={assigneesData}
                                onChange={handleAssigneeChange}
                            />
                            <SelectButton 
                                name={"label-button"}
                                placeholder={label}
                                options={labelsData}
                                onChange={handleLabelChange}
                            />
                            {/* <SelectButton 
                                name={"viewmode-button"}
                                placeholder={viewMode}
                                options={viewModeData}
                                onChange={handleViewModeChange}
                            /> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full">
                {tasks && tasks.length > 0 ? (
                    <>
                    </>
                    // <Gantt
                    //     tasks={tasks}
                    //     viewMode={viewMode}
                    //     locale={'id-ID'}
                    //     onDateChange={handleTaskDateChange}
                    //     onExpanderClick={handleExpanderClick}
                    // />
                ) : (
                    <div className="text-dark-blue text-center text-sm md:text-base">
                        Belum ada data tugas yang tersedia.
                    </div>
                )}
            </div>
        </div>
    )
}