"use client"

import { useEffect, useState } from "react";
import AssignedTaskItem from "./AssignedTaskItem";
import OverviewCard from "./OverviewCard";
import { GoPlus as PlusIcon } from "react-icons/go";
import { getDocumentReference, getQueryReferenceOrderBy } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import Table from "../../common/table/Table";
import UserIcon from "../../common/UserIcon";
import LinkButton from "../../common/button/LinkButton";
import { getPriority } from "@/app/lib/string";
import Label from "../../common/Label";

export default function OverviewContent({ projectId }){

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

    useEffect(() => {
        if(!projectId) return
        const reference = getQueryReferenceOrderBy({collectionName: "tasks", field: "projectId", id: projectId, orderByKey:"order"})
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const data = await Promise.all(snapshot.docs.map(async(document) => {
                const status = document.data().status
                if(status){
                    const statusRef = getDocumentReference({collectionName: "taskStatuses", id: status})
                    const statusSnap = await getDoc(statusRef)
                    const statusData = statusSnap.data()
                    return({
                        ...document.data(),
                        statusName: statusData.statusName,
                    })
                }
                return({
                    id: document.id,
                    status: null,
                    ...document.data()
                })
            }))
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setTaskData(data)
            // setTaskData(data.slice(0, 3))
            console.log(data)
        })
        return () => unsubscribe()
    }, [projectId])

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
                        {dueDate || "-"}
                    </div>
                )
            }
        },
        {
            accessorKey: 'priority',
            header: 'Prioritas',
            cell: ({ row }) => {
                const priority = row.getValue('priority')
                return(
                    <div className="w-fit h-full block font-semibold">
                        <Label 
                            text={getPriority(priority).toUpperCase()}
                        />
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
                        <p>{fullName?.split(' ')[0]}</p>
                    </div>
                )
            }
        },
        {
            accessorKey: 'statusName',
            header: 'Status',
            cell: ({ row }) => {
                const statusName = row.getValue('statusName')
                return(
                    <div className="w-fit h-full block font-semibold">
                        <Label text={statusName.toUpperCase()}/>
                    </div>
                )
            }
        },
    ]

    return(
        <div className="flex flex-col gap-4">
            {taskData.length === 0 ? (
                <OverviewCard title="Tugas Terbaru">
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-center">
                            Belum ada data tugas yang tersedia.
                        </div>
                        <LinkButton href={`/projects/${projectId}/board`} variant="primary" size={`md`} className="mt-2 md:mt-4 px-2 xl:px-4">
                            Buat Tugas Baru Sekarang
                        </LinkButton>
                    </div>
                </OverviewCard>
            ) : (
                <OverviewCard title="Tugas Terbaru" action={"Lihat semua"} href={`/projects/${projectId}/tasks`}>
                    <Table 
                        data={taskData}
                        columns={columns}
                        usePagination={false}
                    />
                </OverviewCard>
            )}
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <OverviewCard title="Ditugaskan Kepada Saya" action={<PlusIcon className="text-xl md:text-2xl" />}>
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