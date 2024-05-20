"use client"

import { useEffect, useState } from "react"
import AssignedTaskItem from "./AssignedTaskItem"
import OverviewCard from "./OverviewCard"
import { getDocumentReference, getQueryReference, getQueryReferenceOrderBy } from "@/app/firebase/util"
import { getDoc, onSnapshot } from "firebase/firestore"
import Table from "../../common/table/Table"
import UserIcon from "../../common/UserIcon"
import LinkButton from "../../common/button/LinkButton"
import { getPriority } from "@/app/lib/string"
import Label from "../../common/Label"
import { dateFormat } from "@/app/lib/date"
import { getUserProfile } from "@/app/lib/fetch/user"
import AssignedCommentItem from "./AssignedCommentItem"
import { useRole } from "@/app/lib/context/role"
import { validateUserRole } from "@/app/lib/helper"

export default function OverviewContent({ projectId }){
    const [userId, setUserId] = useState(null)
    const [projectKey, setProjectKey] = useState(null)
    const role = useRole()

    useEffect(() => {
        getUserProfile().then((res) => {
            if(res.error){
                console.log(res.error)
            }else{
                setUserId(res.data.uid)
            }
        })
    }, [])

    const [taskData, setTaskData] = useState([])
    const [assignedTaskData, setAssignedTaskData] = useState([])
    const [assignedCommentData, setAssignedCommentData] = useState([])

    useEffect(() => {
        if(!projectId) return
        const reference = getDocumentReference({collectionName: "projects", id: projectId})
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const projectData = snapshot.data()
            setProjectKey(projectData.key)
        })
        return () => unsubscribe()
    }, [projectId])

    useEffect(() => {
        if(!projectId) return
        const reference = getQueryReferenceOrderBy({collectionName: "tasks", field: "projectId", id: projectId, orderByKey:"order"})
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const data = await Promise.all(snapshot.docs.map(async(document) => {
                const taskData = document.data()
                const assignedTo = taskData.assignedTo
                const status = taskData.status
                const task = {
                    id: document.id,
                    ...taskData
                }
                if(assignedTo){
                    const assignedToRef = getDocumentReference({ collectionName: "users", id: assignedTo });
                    const assignedToSnap = await getDoc(assignedToRef);
                    if (assignedToSnap.exists()) {
                        task.assignedToData = assignedToSnap.data();
                    }
                }
                if(status){
                    const statusRef = getDocumentReference({ collectionName: "taskStatuses", id: status });
                    const statusSnap = await getDoc(statusRef);
                    if (statusSnap.exists()) {
                        task.statusData = statusSnap.data();
                    }
                }
                return task
            }))
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            // setTaskData(data)
            setTaskData(data.slice(0, 5))
            console.log(data)
            const filteredData = data.filter((task) => task.assignedTo === userId)
            // setAssignedTaskData(data)
            setAssignedTaskData(filteredData.slice(0, 5))
        })
        return () => unsubscribe()
    }, [projectId, userId])

    useEffect(() => {
        if(!projectId || !userId) return
        const reference = getQueryReference({collectionName: "comments", field: "projectId", id: projectId})
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const data = await Promise.all(snapshot.docs.map(async(document) => {
                const commentData = document.data()
                const commentTaskId = commentData.taskId
                const commentUserId = commentData.userId
                const comment = {
                    id: document.id,
                    ...commentData
                }
                if(commentTaskId){
                    const taskRef = getDocumentReference({ collectionName: "tasks", id: commentTaskId });
                    const taskSnap = await getDoc(taskRef);
                    if (taskSnap.exists()) {
                        comment.task = taskSnap.data();
                    }
                }
                if(commentUserId){
                    const userRef = getDocumentReference({ collectionName: "users", id: commentUserId });
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        comment.user = userSnap.data();
                    }
                }
                return comment
            }))
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            const filteredComments = data.filter((comment) => comment.commentText.includes(userId))
            // setAssignedCommentData(data)
            setAssignedCommentData(filteredComments.slice(0, 5))
        })
        return () => unsubscribe()
    }, [projectId, userId])

    const columns = [
        {
            accessorKey: 'id',
        },
        {
            accessorKey: 'displayId',
            header: 'ID Tugas',
            cell: ({ row }) => {
                const displayId = row.getValue('displayId')
                return(
                    <div className="w-full h-full block">
                        {projectKey}-{displayId}
                    </div>
                )
            }
        },
        {
            accessorKey: 'taskName',
            header: 'Nama Tugas',
            cell: ({ row }) => {
                const taskName = row.getValue('taskName')
                return(
                    <div className="w-full h-full block">
                        {taskName}
                    </div>
                )
            }
        },
        {
            accessorKey: 'dueDate',
            header: 'Tenggat Waktu',
            cell: ({ row }) => {
                const dueDate = row.getValue('dueDate')
                return(
                    <div className="w-full h-full block">
                        {dateFormat(dueDate) || "Belum ditetapkan"}
                    </div>
                )
            }
        },
        {
            accessorKey: 'priority',
            header: 'Prioritas',
            cell: ({ row }) => {
                const priority = row.getValue('priority')
                const { label, color } = getPriority(priority)
                return(
                    <div className="w-fit h-full block font-semibold">
                        <Label text={label.toUpperCase()}color={color}/>
                    </div>
                )
            }
        },
        {
            accessorKey: 'assignedToData',
            header: 'Penerima Tugas',
            cell: ({ row }) => {
                const { fullName, profileImage } = row.getValue('assignedToData') ?? {}
                return(
                    <>
                        {fullName ? (
                            <div className="flex gap-2 items-center">
                                <UserIcon size="sm" fullName={fullName} src={profileImage?.attachmentStoragePath} alt=""/>
                                <p>{fullName}</p>
                            </div>
                        ) : (
                            <div className="w-full h-full block">
                                {"Belum ditugaskan"}
                            </div>
                        )}
                    </>
                )
            }
        },
        {
            accessorKey: 'statusData',
            header: 'Status',
            cell: ({ row }) => {
                const { statusName } = row.getValue('statusData') ?? {}
                return(
                    <Label text={statusName.toUpperCase()}/>
                )
            }
        },
    ]

    return(
        <div className="flex flex-col gap-4">
            {taskData.length === 0 ? (
                <OverviewCard title="Tugas Terbaru">
                    <div className="max-h-[300px] md:h-[200px] overflow-hidden">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-center">
                                Belum ada data tugas yang tersedia.
                            </div>
                            {validateUserRole({ userRole: role, minimumRole: 'Member' }) && (
                                <LinkButton href={`/projects/${projectId}/board`} variant="primary" size={`md`} className="mt-2 md:mt-4 px-2 xl:px-4">
                                    Buat Tugas Baru Sekarang
                                </LinkButton>
                            )}
                        </div>
                    </div>
                </OverviewCard>
            ) : (
                <OverviewCard title="Tugas Terbaru" action={"Lihat semua"} href={`/projects/${projectId}/tasks`}>
                    <div className="max-h-[300px] md:h-[200px] overflow-hidden">
                        <Table 
                            data={taskData}
                            columns={columns}
                            usePagination={false}
                            fullWidth={false}
                        />
                    </div>
                </OverviewCard>
            )}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <OverviewCard title="Ditugaskan Kepada Saya">
                    <div className="flex flex-col gap-2 max-h-[200px] md:h-[175px] overflow-x-hidden overflow-y-scroll">
                        {validateUserRole({ userRole: role, minimumRole: 'Member' }) && assignedTaskData && assignedTaskData.length > 0 ? (
                            <>
                                {assignedTaskData.map((task, index) => (
                                    <AssignedTaskItem 
                                        key={index}
                                        title={task.taskName}
                                        type={task.type}
                                        startDate={task.startDate}
                                        endDate={task.dueDate}
                                        status={task.status}
                                        priority={task.priority}
                                        projectKey={projectKey}
                                        displayId={task.displayId}
                                        href={`/projects/${projectId}/tasks?taskId=${task.id}`}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="text-center">
                                Belum ada tugas yang ditugaskan kepada Anda.
                            </div>
                        )}
                    </div>
                </OverviewCard>
                <OverviewCard title="Komentar Terbaru">
                <div className="flex flex-col gap-2 max-h-[200px] md:h-[175px] overflow-x-hidden overflow-y-scroll">
                        {assignedCommentData && assignedCommentData.length > 0 ? (
                            <>
                                {assignedCommentData.map((comment, index) => (
                                    <AssignedCommentItem
                                        key={index}
                                        text={comment.commentText}
                                        user={comment.user}
                                        createdAt={comment.createdAt}
                                        projectKey={projectKey}
                                        displayId={comment.task.displayId}
                                        href={`/projects/${projectId}/tasks?taskId=${comment.taskId}`}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="text-center">
                                Belum ada komentar yang menyebut Anda.
                            </div>
                        )}
                    </div>
                </OverviewCard>
            </div>
        </div>
    )
}