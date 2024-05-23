"use client"

import SearchBar from "../../common/SearchBar";
import { useEffect, useState } from "react";
import SelectButton from "../../common/button/SelectButton";
import { IoFilter as FilterIcon } from "react-icons/io5"
import { useRole } from "@/app/lib/context/role";
import { getDocumentReference, getQueryReference, getQueryReferenceOrderBy } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import Calendar from "../../common/calendar/Calendar";
import { validateUserRole } from "@/app/lib/helper";

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
    const [projectKey, setProjectKey] = useState(null)
    const [taskData, setTaskData] = useState([])
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if(!projectId) return
        const reference = getDocumentReference({collectionName: "projects", id: projectId})
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const projectData = snapshot.data()
            setProjectKey(projectData.key)
        })
        return () => unsubscribe()
    }, [projectId])

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

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
                {label: "Label", value: "Label"},
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
                    { label: "Penerima", value: "Penerima" },
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
                {label: "Status", value: "Status"},
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
                const assignedTo = taskData.assignedTo
                const status = taskData.status
                const labels = taskData.labels
                const parentId = taskData.parentId
                const task = {
                    id: document.id,
                    ...taskData
                }
                if(assignedTo){
                    const assignedToRef = getDocumentReference({ collectionName: "users", id: assignedTo });
                    const assignedToSnap = await getDoc(assignedToRef);
                    if (assignedToSnap.exists()) {
                        task.assignedToData = {
                            id: assignedTo,
                            ...assignedToSnap.data()
                        }
                    }
                }
                if(status){
                    const statusRef = getDocumentReference({ collectionName: "taskStatuses", id: status });
                    const statusSnap = await getDoc(statusRef);
                    if (statusSnap.exists()) {
                        task.statusData = statusSnap.data();
                    }
                }
                if(labels){
                    const labelsData = await Promise.all(labels.map(async(label) => {
                        const labelRef = getDocumentReference({ collectionName: "labels", id: label });
                        const labelSnap = await getDoc(labelRef);
                        if (labelSnap.exists()) {
                            return labelSnap.data().content;
                        }
                    }))
                    task.labelsData = labelsData.join(", ");
                }
                if(parentId){
                    const parentRef = getDocumentReference({ collectionName: "tasks", id: parentId });
                    const parentSnap = await getDoc(parentRef);
                    if (parentSnap.exists()) {
                        task.parentTaskData = parentSnap.data();
                    }
                }
                return task
            }))
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            const filteredData = data.filter((task) => (task.startDate !== null && task.dueDate !== null) && task.taskName.toLowerCase().includes(query));
            setTaskData(filteredData)
            setTasks(filteredData);
        })
        return () => unsubscribe()
    }, [projectId, query])

    useEffect(() => {
        let filteredData = taskData;
        if(assignee !== "Penerima"){
            filteredData = filteredData.filter(item => item.taskName.toLowerCase().includes(query) && item.assignedToData?.fullName === assignee);
        }
        if(status !== "Status"){
            filteredData = filteredData.filter(item => item.taskName.toLowerCase().includes(query) && item.statusData?.statusName === status);
        }
        if(label !== "Label"){
            filteredData = filteredData.filter(item => item.taskName.toLowerCase().includes(query) && item.labelsData?.includes(label));
        }
        setTasks(filteredData);
    }, [taskData, assignee, status, label, query]);

    const handleAssigneeChange = (value) => {
        setAssignee(value)
    }

    const handleStatusChange = (value) => {
        setStatus(value)
    }

    const handleLabelChange = (value) => {
        setLabel(value)
    }

    return (
        <div className="h-full overflow-y-auto flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6 z-almostFixed">
                    <SearchBar placeholder={"Cari jadwal..."} handleSearch={handleSearch}/>
                    <div className="relative">
                        <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
                            <FilterIcon size={20}/>
                        </button>
                        <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-fixed absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
                            <SelectButton 
                                name={"assignee-button"}
                                placeholder={assignee}
                                options={assigneesData}
                                onChange={handleAssigneeChange}
                            />
                            <SelectButton 
                                name={"status-button"}
                                placeholder={status}
                                options={statusData}
                                onChange={handleStatusChange}
                            />
                            <SelectButton 
                                name={"label-button"}
                                placeholder={label}
                                options={labelsData}
                                onChange={handleLabelChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full h-full flex-grow overflow-auto flex justify-start items-center">
                <div className="min-w-[900px] max-w-[1200px] h-full px-2.5 pt-2 pb-4">
                    <Calendar
                        projectKey={projectKey}
                        projectId={projectId}
                        tasks={tasks}
                        isEditable={validateUserRole({ userRole: role, minimumRole: 'Member' }) ? true : false}
                    />
                </div>
            </div>
        </div>
    )
}