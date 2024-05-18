"use client"

import { useEffect, useState } from "react";
import AssignedTaskItem from "./AssignedTaskItem";
import OverviewCard from "./OverviewCard";
import { getDocumentReference, getQueryReferenceOrderBy } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import Table from "../../common/table/Table";
import UserIcon from "../../common/UserIcon";
import LinkButton from "../../common/button/LinkButton";
import { getPriority } from "@/app/lib/string";
import Label from "../../common/Label";
import { dateFormat } from "@/app/lib/date";
import { getUserProfile } from "@/app/lib/fetch/user";

export default function OverviewContent({ projectId }){
    
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        getUserProfile().then((res) => {
            if(res.error){
                console.log(res.error)
            }else{
                setUserId(res.data.uid)
            }
        })
    }, [])

    const assignedTasksDummyData = [
        {
            title: "Create Landing Page",
            startDate: new Date("2024-04-17"),
            endDate: new Date("2024-04-20"),
            status: "TO DO",
            priority: 1,
            id: "TASK-1",
            href: `#`
        },
        {
            title: "API Integration",
            startDate: new Date("2024-04-09"),
            endDate: new Date("2024-04-15"),
            status: "IN PROGRESS",
            priority: 2,
            id: "TASK-2",
            href: `#`
        },
    ]

    const [taskData, setTaskData] = useState([])
    const [assignedTaskData, setAssignedTaskData] = useState([])

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
                        task.assignedTo = assignedToSnap.data();
                    }
                }
                if(status){
                    const statusRef = getDocumentReference({ collectionName: "taskStatuses", id: status });
                    const statusSnap = await getDoc(statusRef);
                    if (statusSnap.exists()) {
                        task.status = statusSnap.data();
                    }
                }
                return task
            }))
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setTaskData(data)
            // setTaskData(data.slice(0, 3))
            console.log(data)
        })
        return () => unsubscribe()
    }, [projectId])

    useEffect(() => {
        console.log(taskData)
    }, [taskData])

    const columns = [
        {
            accessorKey: 'id',
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
                        {dateFormat(dueDate) || "-"}
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
            accessorKey: 'assignedTo',
            header: 'Penerima Tugas',
            cell: ({ row }) => {
                const { fullName, profileImage } = row.getValue('assignedTo') ?? {}
                return(
                    <div className="flex gap-2 items-center">
                        <UserIcon size="sm" fullName={fullName} src={profileImage?.attachmentStoragePath} alt=""/>
                        <p>{fullName}</p>
                    </div>
                )
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { statusName } = row.getValue('status') ?? {}
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
                    <div className="max-h-[200px] overflow-hidden">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-center">
                                Belum ada data tugas yang tersedia.
                            </div>
                            <LinkButton href={`/projects/${projectId}/board`} variant="primary" size={`md`} className="mt-2 md:mt-4 px-2 xl:px-4">
                                Buat Tugas Baru Sekarang
                            </LinkButton>
                        </div>
                    </div>
                </OverviewCard>
            ) : (
                <OverviewCard title="Tugas Terbaru" action={"Lihat semua"} href={`/projects/${projectId}/tasks`}>
                    <div className="max-h-[200px] overflow-scroll">
                        <Table 
                            data={taskData}
                            columns={columns}
                            usePagination={false}
                        />
                    </div>
                </OverviewCard>
            )}
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <OverviewCard title="Ditugaskan Kepada Saya">
                    <div className="flex flex-col gap-2">
                        {assignedTasksDummyData.map((task, index) => (
                            <AssignedTaskItem key={index} {...task}/>
                        ))}
                    </div>
                </OverviewCard>
                <OverviewCard title="Komentar Terbaru">

                </OverviewCard>
            </div>
        </div>
    )
}