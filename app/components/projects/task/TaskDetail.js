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
import { useRouter } from "next/navigation"
import { pickTextColorBasedOnBgColor } from "@/app/lib/color"

import { IoIosCloseCircle as CloseIcon } from "react-icons/io";
import { getAllTeamMember } from "@/app/lib/fetch/team"
import { updateTask, deleteTask, reorderTask, getAllTask } from "@/app/lib/fetch/task"
import { useRole } from "@/app/lib/context/role"
import { validateUserRole } from "@/app/lib/helper"
import SelectButton from "../../common/button/SelectButton"
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus"
import SimpleTextareaForm from "../../common/SimpleTextareaForm"
import SimpleDateForm from "../../common/SimpleDateForm"
import ParentSelectButton from "../../common/ParentSelectButton"
import LabelInput from "./LabelInput"
import EmptyState from "../../common/EmptyState"

const AttachmentSection = dynamic(() => import("./AttachmentSection"))
const SubtaskSection = dynamic(() => import("./SubtaskSection"))

function TaskDetail({ taskId, closeFn }){
    const [task, setTask] = useState()
    const [taskNotFound, setTaskNotFound] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [updateConfirmation, setUpdateConfirmation] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [editDescription, setEditDescription] = useState(false)
    const [editLabels, setEditLabels] = useState(false)
    const [editStartDate, setEditStartDate] = useState(false)
    const [editDueDate, setEditDueDate] = useState(false)
    const [teamOptions, setTeamOptions] = useState([])
    const [statusOptions, setStatusOptions] = useState([])
    const [parentTaskOptions, setParentTaskOptions] = useState([])
    const [labels, setLabels] = useState([])
    const [project, _] = useSessionStorage("project")
    const role = useRole()
    const router = useRouter()

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
        const fetchParentOptions = async() => {
            getAllTask(project.id)
                .then(res => {
                    if(res.data){
                        const parentOptions =  res.data
                            .filter(t => t.type === "Task")
                            .map(t => ({
                                label: `${project.key}-${t.displayId} ${t.taskName}`,
                                value: t.id
                            }))
                        setParentTaskOptions(parentOptions)
                    }else{
                        setParentTaskOptions([])
                    }
                })
        }
        if(task && project && task.type === 'SubTask') fetchParentOptions()
    }, [task, project])

    useEffect(() => {
        const fetchTeamOptions = async() => {
            getAllTeamMember({ projectId: project.id, excludeViewer: true })
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
        if(task && task.labels){
            const labels = task.labels.map(label => ({
                value: label.id,
                content: label.content,
                tagColor: label.backgroundColor,
                style: `--tag-bg:${label.backgroundColor};--tag-text-color:${pickTextColorBasedOnBgColor(label.backgroundColor)};--tag-hover:${label.backgroundColor};--tag-remove-btn-color:${pickTextColorBasedOnBgColor(label.backgroundColor)};--tag-remove-bg:${label.backgroundColor};--tag-remove-btn-bg--hover:${pickTextColorBasedOnBgColor(label.backgroundColor)};--tag-border-radius:99px;`
            }))
            const stringified_labels = JSON.stringify(labels)
            setLabels(stringified_labels)
        }
    }, [task])

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
                const parentId = doc.data().parentId
                const parentDoc = parentId && await getDoc(getDocumentReference({ collectionName: "tasks", id: parentId }))
                const parent = parentDoc && parentDoc.data()

                const assignedToId = doc.data().assignedTo
                const assignedToDoc = assignedToId && await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId }))
                const assignedTo = assignedToDoc && {id: assignedToDoc.id, ...assignedToDoc.data()}
                setTask({
                    id,
                    ...doc.data(),
                    labels: labels,
                    assignedTo: assignedTo,
                    parent: parent,
                })
                setTaskNotFound(false)
                return
            }
            setTask(null)
            setTaskNotFound(true)
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
          if(taskName !== task.taskName) await updateTask({ taskId: taskId, taskName })
        }catch(e){
          console.log(e)
        }finally{
          setUpdateConfirmation(false)
          setUpdateLoading(false)
        }
    }

    const handleUpdateStartDate = async(e) => {
        setUpdateLoading(true)

        const startDate = e.target.value
        await updateTask({ taskId, startDate})

        setEditStartDate(false)
        setUpdateLoading(false)
    }

    const handleUpdateDueDate = async(e) => {
        setUpdateLoading(true)

        const dueDate = e.target.value
        await updateTask({ taskId, dueDate})

        setEditDueDate(false)
        setUpdateLoading(false)
    }

    const handleUpdateTaskDescription = async(e) => {
        e.preventDefault()
        setUpdateLoading(true)

        const formData = new FormData(document.querySelector(`#task-${taskId}-description-form`))
        const taskDescription = formData.get(`task-${taskId}-description`) || null

        if(taskDescription !== task.description) await updateTask({ taskId, description: taskDescription ? taskDescription.trim() : null})

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

    const handleParentChange = async(parentId) => {
        setUpdateLoading(true)
        try{
            if(parentId && parentId !== task.parentId) {
                await updateTask({ taskId, parentId: parentId})
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
                await updateTask({ taskId: taskId, priority: priority})
            }  
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }

    const handleLabelChange = async() => {
        const labelArr = labels ? JSON.parse(labels) : []
        const newLabelLength = labelArr.length
        const taskLabelLength = task.labels.length
        let isDiff = true

        if(newLabelLength === taskLabelLength){
            if(newLabelLength > 0){
                const result = labelArr.every(label1 => task.labels.find(label2 => label1.id === label2.id))
                isDiff = !result
            }
            else if (newLabelLength <= 0) isDiff = false
        }

        try{
            if(isDiff){
                setUpdateLoading(true)
                await updateTask({ taskId: taskId, labels: labels === "" ? null : labels})
            }
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
            setEditLabels(false)
        }
    }
  
    const handleDeleteTask = async(e) => {
        setUpdateLoading(true)

        try{
            const res = await deleteTask({ taskId: taskId })

            if(res.success && closeFn) closeFn()
        }catch(e){
            console.log(e)
        }finally{
            setDeleteConfirmation(false)
            setUpdateLoading(false)
        }
    }

    if(taskNotFound) return(
        <EmptyState message="Tugas tidak dapat ditemukan."/>
    )

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

    const validateMember = validateUserRole({ userRole: role, minimumRole: 'Member' })
    return(
        <div className={`w-full h-full flex flex-col gap-3 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg overflow-y-auto`}>
            {updateLoading && <PopUpLoad/>}
            {editLabels &&
            <PopUpForm
                title={"Ubah Label"}
                wrapContent
            >
                <div>
                    <LabelInput 
                        hideLabel
                        projectId={project.id} 
                        labelData={labels}
                        onChange={(e) => setLabels(e.detail.value)} 
                    />
                    <div className="mt-4 flex justify-end gap-2 md:gap-4">
                        <Button variant="danger" onClick={() => setEditLabels(false)}
                        >Batal</Button>
                        <Button variant="primary" onClick={handleLabelChange}>Ubah</Button>
                    </div>
                </div>
            </PopUpForm>}
            {updateConfirmation &&
              <UpdateTaskNameForm 
                taskName={task.taskName} 
                onSubmit={handleUpdateTaskName} 
                onClose={() => setUpdateConfirmation(false)}
              />}
            {deleteConfirmation &&
              (<PopUpForm
                title={"Hapus Tugas"}
                message={'Apakah Anda yakin ingin menghapus tugas ini?'}
                wrapContent
              >
                <>
                  <div className="mt-4 flex justify-end gap-2 md:gap-4">
                    <Button variant="danger" onClick={handleDeleteTask}>Hapus</Button>
                    <Button variant="secondary" onClick={() => setDeleteConfirmation(false)}
                    >Batal</Button>
                  </div>
                </>
              </PopUpForm>)}
            <div className="flex items-start gap-4">
                <div className="flex items-end flex-grow">
                    <div className={`text-lg md:text-2xl font-semibold text-dark-blue`}>
                        {project && <span>[{project.key}-{task.displayId}]</span>} {task.taskName}
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    {validateMember &&
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
                        <p className="font-semibold text-xs md:text-sm pt-2">Penerima</p>
                        <div className="col-span-2">
                            <UserSelectButton 
                                name={`assignedToDetail-${taskId}`}
                                type="button"
                                defaultValue={task.assignedTo}
                                options={teamOptions}
                                onChange={handleAssigneeChange}
                                disabled={!validateMember}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Label</p>
                        <div className="col-span-2">
                            <div 
                                className={`flex flex-wrap gap-1 md:gap-2 w-full p-2 cursor-pointer hover:bg-gray-200 rounded transition-colors duration-300`} 
                                onClick={validateMember ? () => setEditLabels(true) : null}
                            >
                                {task.labels && task.labels.length > 0 ? 
                                task.labels.map(label => (
                                    <Label key={label.id} text={label.content} color={label.backgroundColor}/>
                                )) :
                                <p className="text-xs md:text-sm text-dark-blue/80">Belum ada label yang ditambahkan..</p>}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Tanggal Mulai</p>
                        <div className="col-span-2">
                            {!editStartDate ? 
                            <p 
                                className="w-full p-2 cursor-pointer text-dark-blue/80 hover:bg-gray-200 rounded transition-colors duration-300" 
                                onClick={validateMember ? () => setEditStartDate(true) : null}
                            >
                                {dateFormat(task.startDate) ?? "Belum diatur"}
                            </p> :
                            <SimpleDateForm
                                name={`task-${taskId}-start-date`}
                                value={task.startDate}
                                max={task.dueDate}
                                onChange={handleUpdateStartDate}
                                onCancel={() => setEditStartDate(false)}
                            />}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Tenggat Waktu</p>
                        <div className="col-span-2">
                            {!editDueDate ? 
                            <p 
                                className="w-full p-2 cursor-pointer text-dark-blue/80 hover:bg-gray-200 rounded transition-colors duration-300" 
                                onClick={validateMember ? () => setEditDueDate(true) : null}
                            >
                                {dateFormat(task.dueDate) ?? "Belum diatur"}
                            </p> :
                            <SimpleDateForm
                                name={`task-${taskId}-start-date`}
                                value={task.dueDate}
                                min={task.startDate}
                                onChange={handleUpdateDueDate}
                                onCancel={() => setEditDueDate(false)}
                            />}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Prioritas</p>
                        <div className="col-span-2">
                            <SelectButton
                                name={`task-${taskId}-priority`}
                                defaultValue={priorityList.find(priority => priority.value === task.priority)}
                                options={priorityList} 
                                onChange={handlePriorityChange}
                                disabled={!validateMember}
                                buttonClass={getSelectPriorityClass()}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Status</p>
                        <div className="col-span-2">
                            <SelectButton
                                name={`task-${taskId}-status`}
                                defaultValue={statusOptions.find(status => status.value === task.status)}
                                options={statusOptions} 
                                disabled={!validateMember}
                                onChange={handleStatusChange}
                            />
                        </div>
                    </div>
                    {task.type === "SubTask" &&
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Induk Tugas</p>
                        {validateMember}
                        <div className="col-span-2">
                            <ParentSelectButton
                                name={`task-${taskId}-parent`}
                                defaultValue={parentTaskOptions.find(t=> t.value === task.parentId)}
                                disabled={!validateMember}
                                options={parentTaskOptions}
                                onChange={handleParentChange}
                            />
                        </div>
                    </div>}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-start gap-2">
                        <p className="font-semibold text-xs md:text-sm">Deskripsi Tugas</p>
                        {!editDescription ? 
                        <p 
                            className="w-full cursor-pointer text-xs md:text-sm text-dark-blue/80 hover:bg-gray-200 p-2 rounded transition-colors duration-300"
                            onClick={validateMember ? () => setEditDescription(true) : null} 
                        >
                            {task.description ? task.description : "Tambahkan deskripsi tugas..."}
                        </p> :
                        <SimpleTextareaForm
                            name={`task-${taskId}-description`}
                            max={1000}
                            onSubmit={handleUpdateTaskDescription}
                            onBlur={() => setEditDescription(false)}
                            placeholder={"Masukkan deskripsi tugas..."}
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