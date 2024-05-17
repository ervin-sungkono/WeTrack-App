import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import CustomTooltip from "../../common/CustomTooltip"
import UserSelectButton from "../../common/UserSelectButton"
import SelectButton from "../../common/button/SelectButton"
import SimpleInputForm from "../../common/SimpleInputField"
import PopUpLoad from "../../common/alert/PopUpLoad"
import Label from "../../common/Label"
import Link from "next/link"

import { FiPlus as PlusIcon } from "react-icons/fi"
import { FaTasks as TaskIcon } from "react-icons/fa";
import { getPriority } from "@/app/lib/string"
import { getQueryReferenceOrderBy, getDocumentReference } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"
import { createNewTask } from "@/app/lib/fetch/task"
import { useSessionStorage } from "usehooks-ts"
import { debounce } from "@/app/lib/helper"

const Table = dynamic(() => import("../../common/table/Table"))

export default function SubtaskSection({ projectId, taskId }){
    const [subtaskData, setSubtaskData] = useState([])
    const [isCreatingSubtask, setCreatingSubtask] = useState(false)
    const [loading, setLoading] = useState(false)
    const [project, _] = useSessionStorage("project")

    const getPercentageCompletedSubTask = () => {
        try{
            const completedTask = subtaskData.filter(subtask => subtask.status === project.endStatus).length
            const taskCount = Math.max(subtaskData.length, 1)

            return `${Math.round((completedTask/taskCount * 100))}%`
        }catch(e){
            console.log(e)
            return "NaN"
        }
    }

    const updateAssignee = (value) => {
        console.log(value)
    }

    useEffect(() => {
        if(!taskId) return

        const reference = getQueryReferenceOrderBy({ collectionName: 'tasks', field: 'parentId', id: taskId, orderByKey: "createdAt" })
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const updatedSubTask = await Promise.all(snapshot.docs.map(async(document) => {
                const assignedTo = document.data().assignedTo
                if(assignedTo){
                    const userRef = getDocumentReference({ collectionName: "users", id: assignedTo })
                    const userSnap = await getDoc(userRef)
                    const { fullName, profileImage } = userSnap.data()

                    return({
                        id: document.id,
                        ...document.data(),
                        assignedTo: {
                            fullName,
                            profileImage
                        }
                    })
                }
                return({
                    id: document.id,
                    ...document.data(),
                })
            }))
            setSubtaskData(updatedSubTask)
        })

        return () => unsubscribe()
    }, [taskId])

    const columns = [
        {
            accessorKey: 'id',
        },
        {
            accessorKey: 'taskName',
            header: 'Nama',
            cell: ({ row }) => {
                const taskId = row.getValue('id')
                const taskName = row.getValue('taskName')
                return <Link href={`/project/${projectId}/tasks/${taskId}`}>{taskName}</Link>
            }
        },
        {
            accessorKey: 'priority',
            header: 'Prioritas',
            cell: ({ row }) => {
                const priority = row.getValue("priority")
                const { label, color } = getPriority(priority)
                return (
                    <div className="flex justify-start">
                        <Label text={label.toUpperCase()} color={color}/>
                    </div>
                )
            },
            size: 140
        }, 
        {
            accessorKey: 'assignedTo',
            header: "Penerima",
            cell: ({ row }) => {
                const id = row.getValue('id')
                const assignedTo = row.getValue("assignedTo")

                return (
                    <UserSelectButton 
                        name={`assignee-${id}`}
                        type="button"
                        placeholder={assignedTo}
                        options={[]}
                        onChange={updateAssignee}
                    />
                )
            },
        },
        {
            accessorKey: 'statusId',
            header: "Status",
            cell: ({ row }) => {
                const id = row.getValue("id")
                const statusId = row.getValue("statusId")
                // tambah logic untuk get user

                return (
                    <SelectButton 
                        name={`status-${id}`}
                        defaultValue={"Todo"}
                        options={[]}
                        onChange={(value) => console.log(value)}
                        buttonClass="border-none"
                    />
                )
            },
            size: 140
        },
    ]

    const createSubtask = async(e) => {
        if(!project) return
        e.preventDefault()
        setLoading(true)
        setCreatingSubtask(false)
    
        const formData = new FormData(document.querySelector(`#subTaskName-form`))
        const taskName = formData.get("subTaskName")
        
        debounce(
            createNewTask({
                taskName, 
                type: "SubTask",
                projectId: project.id, 
                statusId: project.startStatus,
                parentId: taskId,
            }).then(() => {setLoading(false)})
        , 100)
    }

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            {loading && <PopUpLoad/>}
            <div className="relative flex items-center">
                <p className="font-semibold text-xs md:text-sm flex-grow">Subtugas <span>({subtaskData.length})</span></p>
                <div className="flex gap-1">
                    <CustomTooltip id="subtask-tooltip" content={"Tambah Subtugas"}>
                        <button
                            onClick={() => setCreatingSubtask(true)}
                            className={`p-2 hover:bg-gray-200 duration-200 transition-colors rounded`}
                        >
                            <PlusIcon size={16}/>
                        </button>
                    </CustomTooltip>
                </div>
                {isCreatingSubtask && <div className="absolute top-0 left-0 translate-y-10 w-full z-50">
                    <SimpleInputForm
                        name={"subTaskName"}
                        onSubmit={createSubtask}
                        onBlur={() => setCreatingSubtask(false)}
                        placeholder={"Masukkan nama subtugas.."}
                    />
                </div>}
            </div>
            {subtaskData.length > 0 ? 
            <>
                <div className="w-full flex items-center gap-2">
                    <div className="flex-grow h-2 bg-gray-200 rounded-full">
                        <div className="bg-basic-blue h-full rounded-full" style={{width: getPercentageCompletedSubTask()}}></div>
                    </div>
                    <p className="text-xs md:text-sm">{getPercentageCompletedSubTask()} Selesai</p>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    <Table
                        data={subtaskData}
                        columns={columns}
                        usePagination={false}
                    />
                </div>
            </>
            :
            <div className="flex flex-col items-center gap-2 py-8">
                <TaskIcon size={48} className="text-dark-blue/60"/>
                <p className="text-xs md:text-sm text-dark-blue/80">Belum ada subtugas yang ditambahkan.</p>
            </div>}
        </div>
    )
}