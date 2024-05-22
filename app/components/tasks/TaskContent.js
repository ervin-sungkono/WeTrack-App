"use client"
import { useEffect, useState } from "react"

import TaskDetail from "../projects/task/TaskDetail"
import TaskList from "./TaskList"
import SearchBar from "../common/SearchBar"
import SelectButton from "../common/button/SelectButton"
import EmptyState from "../common/EmptyState"
import Button from "../common/button/Button"

import { IoFilter as FilterIcon } from "react-icons/io5"
import { FaFilterCircleXmark as CloseFilterIcon } from "react-icons/fa6";
import { onSnapshot, getDoc } from "firebase/firestore"
import { getQueryReferenceOrderBy, getDocumentReference } from "@/app/firebase/util"
import { getAllTeamMember } from "@/app/lib/fetch/team"
import { getAllLabel } from "@/app/lib/fetch/label"
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus"

export default function TaskContent({ projectId, taskId }){
    const [query, setQuery] = useState("")
    const [filterDropdown, setFilterDropdown] = useState(false)
    const [tasks, setTasks] = useState([])
    const [taskData, setTaskData] = useState()

    const [teamOptions, setTeamOptions] = useState([])
    const [statusOptions, setStatusOptions] = useState([])
    const [labelOptions, setLabelOptions] = useState([])
    const [filterAssignee, setFilterAssignee] = useState(null)
    const [filterStatus, setFilterStatus] = useState(null)
    const [filterLabel, setFilterLabel] = useState(null)

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    useEffect(() => {
        if(!projectId) return

        const reference = getQueryReferenceOrderBy({ collectionName: "tasks", field: "projectId", id: projectId, orderByKey: 'order' })
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const updatedTasks = await Promise.all(snapshot.docs.map(async(doc) => {
                const assignedToId = doc.data().assignedTo
                const assignedToDoc = assignedToId && await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId }))
                const assignedTo = assignedToDoc && {id: assignedToDoc.id, ...assignedToDoc.data()}
                
                return {
                    id: doc.id,
                    ...doc.data(),
                    assignedTo: assignedTo
                }
            }))
            setTasks(updatedTasks)
            setTaskData(updatedTasks[0])
        })

        return () => unsubscribe()
    }, [projectId])

    useEffect(() => {
        const fetchTeamOptions = async() => {
          if(!projectId) return
          const teamData = await getAllTeamMember({ projectId })
          if(teamData.data){
              setTeamOptions([
                ...teamData.data.map(team => ({
                value: team.userId,
                label: team.user.fullName
              }))
            ])
          }
        }
        const fetchStatusOptions = async() => {
            if(!projectId) return
            const statusData = await getAllTaskStatus(projectId)
            if(statusData.data){
                setStatusOptions([
                    ...statusData.data.map(status => ({
                      value: status.id,
                      label: status.status
                    }))
                ])
            }
        }
        const fetchLabelOptions = async() => {
          if(!projectId) return
          const labelData = await getAllLabel({ projectId })
          if(labelData.data){
              setLabelOptions([
                ...labelData.data.map(label => ({
                  value: label.id,
                  label: label.content
                }))
              ])
          }
        }
        fetchTeamOptions()
        fetchStatusOptions()
        fetchLabelOptions()
    }, [projectId])

    const handleAssigneeChange = (val) => {
        setFilterAssignee(val)
    }

    const handleStatusChange = (val) => {
        setFilterStatus(val)
    }

    const handleLabelChange = (val) => {
        setFilterLabel(val)
    }

    const filterTaskData = (taskData) => {
        const filterBySearch = taskData.filter(task => task.taskName.toLowerCase().includes(query))

        const filterByAssignee = filterAssignee ? filterBySearch.filter(task => task.assignedTo?.id === filterAssignee) : filterBySearch

        const filterByStatus = filterStatus ? filterByAssignee.filter(task => task.status === filterStatus) : filterByAssignee

        const filterByLabel = filterLabel ? filterByStatus.filter(task => (task.labels?.find(label => label === filterLabel) != undefined)) : filterByStatus

        return filterByLabel
    }

    const resetFilter = () =>{
        setFilterAssignee(null)
        setFilterStatus(null)
        setFilterLabel(null)
    }

    return(
        <div className="w-full h-full flex flex-col gap-2.5 sm:gap-4 overflow-y-auto">
            <div className="flex flex-col xs:flex-row justify-between gap-4 items-center z-50">
                <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6 z-fixed"> 
                    <SearchBar placeholder={"Cari tugas..."} handleSearch={handleSearch}/>
                    <div className="relative">
                        <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
                            <FilterIcon size={20}/>
                        </button>
                        <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
                            <SelectButton 
                                placeholder={"Penerima"}
                                name={"task-assignee-button"}
                                options={[{label: "Penerima", value: null},...teamOptions]} 
                                onChange={handleAssigneeChange}
                                reset={!filterAssignee}
                            />
                            <SelectButton 
                                placeholder={"Status"}
                                name={"task-status-button"}
                                options={[{label: "Status", value: null},...statusOptions]} 
                                onChange={handleStatusChange}
                                reset={!filterStatus}
                            />
                            <SelectButton 
                                placeholder={"Label"}
                                name={"task-label-button"}
                                options={[{label: "Label", value: null},...labelOptions]} 
                                onChange={handleLabelChange}
                                reset={!filterLabel}
                            />
                            {(filterAssignee || filterLabel || filterLabel) &&
                            <Button variant="primary" size="sm" onClick={() => resetFilter()}>
                                <div className="flex items-center gap-2">
                                <CloseFilterIcon size={16}/>
                                <p>Hapus Filter</p>
                                </div>
                            </Button>}
                        </div>
                    </div>
                </div>
            </div>
            {
                tasks.length > 0 ? 
                <div className="h-full flex flex-col sm:flex-row gap-2 sm:gap-4 overflow-hidden sm:overflow-y-auto">
                    <TaskList tasks={filterTaskData(tasks)} taskId={taskId ?? taskData?.id}/>
                    <TaskDetail taskId={taskId ?? taskData?.id}/>
                </div>
                :
                <EmptyState message="Belum ada tugas yang dibuat."/>
            }
        </div>
    )
}