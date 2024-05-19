"use client"
import { useEffect, useState, memo } from "react"
import dynamic from "next/dynamic"
import Label from "../../common/Label"
import UserSelectButton from "../../common/UserSelectButton"
import DotButton from "../../common/button/DotButton"
import ActivitySection from "./ActivitySection"
import { TailSpin } from "react-loader-spinner"
import ChatSection from "./ChatSection"
import PopUpLoad from "../../common/alert/PopUpLoad"
import UpdateTaskNameForm from "../../common/form/UpdateTaskNameForm"
import PopUpForm from "../../common/alert/PopUpForm"
import Button from "../../common/button/Button"

import { useSessionStorage } from "usehooks-ts"
import { getDocumentReference } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"
import { priorityList } from "@/app/lib/string"
import { dateFormat } from "@/app/lib/date"

import { IoIosCloseCircle as CloseIcon } from "react-icons/io";
import { getAllTeamMember } from "@/app/lib/fetch/team"
import { updateTask, deleteTask, reorderTask } from "@/app/lib/fetch/task"
import { useRole } from "@/app/lib/context/role"
import { validateUserRole } from "@/app/lib/helper"
import SelectButton from "../../common/button/SelectButton"
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus"
import SimpleTextareaForm from "../../common/SimpleTextareaForm"

const AttachmentSection = dynamic(() => import("./AttachmentSection"))
const SubtaskSection = dynamic(() => import("./SubtaskSection"))

function TaskDetail({ taskId, closeFn }){
    const [task, setTask] = useState()
    const [updateLoading, setUpdateLoading] = useState(false)
    const [updateConfirmation, setUpdateConfirmation] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [editDescription, setEditDescription] = useState(false)
    const [teamOptions, setTeamOptions] = useState([])
    const [statusOptions, setStatusOptions] = useState([])
    const [project, _] = useSessionStorage("project")
    const role = useRole()

    const taskActions = [
        {
            label: "Ubah Nama Tugas",
            fnCall: () => setUpdateConfirmation(true),
        },
        {
            label: "Hapus Tugas",
            fnCall: () => setDeleteConfirmation(true),
        },
    ]

    useEffect(() => {
        const fetchTeamOptions = async() => {
            getAllTeamMember({ projectId: project.id })
                .then(res => {
                    if(res.data) setTeamOptions(res.data)
                    else setTeamOptions([])
                })
        }
        const fetchStatusOptions = async() => {
            getAllTaskStatus(project.id)
                .then(res => {
                    if(res.data){
                        setStatusOptions(res.data.map(status => ({
                            label: status.status,
                            value: status.id
                        })))
                    }else setStatusOptions([])
                })
        }
        if(project && project.id) {
            fetchTeamOptions()
            fetchStatusOptions()
        }
    }, [project])

    useEffect(() => {
        if(!taskId) return
        const reference = getDocumentReference({ collectionName: 'tasks', id: taskId })
        const unsubscribe = onSnapshot(reference, async(doc) => {
            if(doc.exists()){
                const id = doc.id
                const labelsData = doc.data().labels
                const labels = labelsData && await Promise.all(labelsData.map(async (label) => {
                    const labelDoc = await getDoc(getDocumentReference({ collectionName: "labels", id: label }))
    
                    return {
                        id: labelDoc.id,
                        ...labelDoc.data() 
                    }
                }))
                const assignedToId = doc.data().assignedTo
                const assignedToDoc = assignedToId && await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId }))
                const assignedTo = assignedToDoc && {id: assignedToDoc.id, ...assignedToDoc.data()}
                setTask({
                    id,
                    ...doc.data(),
                    labels: labels,
                    assignedTo: assignedTo
                })
                return
            }
            setTask(null)
        })

        return () => unsubscribe()
    }, [taskId])

    const getSelectPriorityClass = () => {
        switch(task.priority){
            case 0: 
                return "border-[#C5C5C5] bg-[#C5C5C5] hover:bg-[#C5C5C5]/80"
            case 1:
                return "border-[#006400] bg-[#006400] hover:bg-[#006400]/80 text-white"
            case 2:
                return "border-[#FFBF00] bg-[#FFBF00] hover:bg-[#FFBF00]/80"
            case 3:
                return "border-[#D2222D] bg-[#D2222D] hover:bg-[#D2222D]/80 text-white"
            default:
                return null
        }
    }

    const handleAssigneeChange = async(value) => {
        setUpdateLoading(true)
        try{
            if(value?.id !== task.assignedTo) await updateTask({ taskId, assignedTo: value?.id ?? null })
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }

    const handleUpdateTaskName = async(e, taskName) => {
        setUpdateLoading(true)
  
        try{
          if(taskName !== task.taskName) await updateTask({ taskId: task.id, taskName })
        }catch(e){
          console.log(e)
        }finally{
          setUpdateConfirmation(false)
          setUpdateLoading(false)
        }
    }

    const handleUpdateTaskDescription = async(e) => {
        e.preventDefault()
        setUpdateLoading(true)

        const formData = new FormData(document.querySelector(`#task-${taskId}-description-form`))
        const taskDescription = formData.get(`task-${taskId}-description`) || null

        if(taskDescription !== task.description) await updateTask({ taskId, description: taskDescription ? taskDescription : null})

        setUpdateLoading(false)
        setEditDescription(false)
    }

    const handleStatusChange = async(id) => {
        setUpdateLoading(true)
        try{
            if(id !== task.status) {
                await reorderTask({ 
                    taskId,
                    statusId: task.status,
                    newStatusId: id,
                    oldIndex: task.order
                })
            }  
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }

    const handlePriorityChange = async(priority) => {
        setUpdateLoading(true)
        try{
            if(priority !== task.priority) {
                await updateTask({ taskId: task.id, priority: priority})
            }  
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }
  
    const handleDeleteTask = async(e) => {
        setUpdateLoading(true)

        try{
            await deleteTask({ taskId: item.id })
        }catch(e){
            console.log(e)
        }finally{
            setDeleteConfirmation(false)
            setUpdateLoading(false)
        }
    }

    if(!task) return(
        <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
            <TailSpin 
                color="#47389F"
                height={100}
                width={100}
            />
            <p className="text-sm md:text-base text-dark-blue/80">Memuat data tugas..</p>
        </div>
    )

    return(
        <div className={`w-full h-full flex flex-col gap-3 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg overflow-y-auto`}>
            {updateLoading && <PopUpLoad/>}
            {updateConfirmation &&
              <UpdateTaskNameForm 
                taskName={task.taskName} 
                onSubmit={handleUpdateTaskName} 
                onClose={() => setUpdateConfirmation(false)}
              />
            }
            {deleteConfirmation &&
              (<PopUpForm
                title={"Hapus Tugas"}
                titleSize="large"
                message={'Apakah Anda yakin ingin menghapus tugas ini?'}
                wrapContent
              >
                <>
                  <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                    <Button variant="danger" onClick={handleDeleteTask}>Hapus</Button>
                    <Button variant="secondary" onClick={() => setDeleteConfirmation(false)}
                    >Batal</Button>
                  </div>
                </>
              </PopUpForm>)
            }
            <div className="flex items-start gap-4">
                <div className={`text-lg md:text-2xl font-semibold text-dark-blue flex-grow`}>
                    {project && <span>[{project.key}-{task.displayId}]</span>} {task.taskName}
                </div>
                <div className="flex items-center gap-2.5">
                    {validateUserRole({ userRole: role, minimumRole: 'Member' }) &&
                    <DotButton 
                        name={`task-detail-${taskId}`}
                        actions={taskActions}
                    />}
                    {closeFn && <button onClick={closeFn}><CloseIcon size={32} className="text-basic-blue"/></button>}
                </div>
            </div>
            <div className="h-full flex flex-col overflow-x-hidden overflow-y-auto gap-4 md:gap-6 pr-4 -mr-4 md:pr-8 md:-mr-8 custom-scrollbar">
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                        <p className="font-semibold text-xs md:text-sm">Penerima</p>
                        <div className="col-span-2">
                            <UserSelectButton 
                                name={`assignedToDetail-${task.id}`}
                                type="button"
                                defaultValue={task.assignedTo}
                                options={teamOptions}
                                onChange={handleAssigneeChange}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Label</p>
                        <div className="flex flex-wrap gap-1 md:gap-2 col-span-2">
                            {task.labels.length > 0 ? 
                            task.labels.map(label => (
                                <Label key={label.id} text={label.content} color={label.backgroundColor}/>
                            )) :
                            <div className="text-xs md:text-sm text-dark-blue/80">Belum ada label yang ditambahkan..</div>}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Tanggal Mulai</p>
                        <p>{dateFormat(task.startDate) ?? "Belum diatur"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Tenggat Waktu</p>
                        <p>{dateFormat(task.dueDate) ?? "Belum diatur"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Prioritas</p>
                        <SelectButton
                            name={`task-${task.id}-priority`}
                            defaultValue={priorityList.find(priority => priority.value === task.priority)}
                            options={priorityList} 
                            onChange={handlePriorityChange}
                            buttonClass={getSelectPriorityClass()}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Status</p>
                        <SelectButton
                            name={`task-${task.id}-status`}
                            defaultValue={statusOptions.find(status => status.value === task.status)}
                            options={statusOptions} 
                            onChange={handleStatusChange}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-start gap-2">
                        <p className="font-semibold text-xs md:text-sm">Deskripsi Tugas</p>
                        {!editDescription ? 
                        <p 
                            className="w-full cursor-pointer text-xs md:text-sm text-dark-blue/80 hover:bg-gray-200 p-2 rounded transition-colors duration-300"
                            onClick={() => setEditDescription(true)} 
                        >
                            {task.description ?? "Tambahkan deskripsi tugas.."}
                        </p> :
                        <SimpleTextareaForm
                            name={`task-${taskId}-description`}
                            onSubmit={handleUpdateTaskDescription}
                            onBlur={() => setEditDescription(false)}
                            placeholder={"Masukkan deskripsi tugas.."}
                            defaultValue={task.description}
                        />}
                    </div>
                    <ChatSection taskId={taskId} title={task.taskName}/>
                    <AttachmentSection taskId={taskId}/>
                    {task.type === "Task" && <SubtaskSection taskId={taskId} statusOptions={statusOptions} teamOptions={teamOptions}/>}
                    <ActivitySection taskId={taskId}/>
                </div>
            </div>
        </div>
    )
}

export default memo(TaskDetail)