"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

import SearchBar from "../common/SearchBar"
import SelectButton from "../common/button/SelectButton"
import Table from "../common/table/Table"
import TableActionButton from "../common/table/TableActionButton"
import UserIcon from "../common/UserIcon"
import LinkButton from "../common/button/LinkButton"
import EmptyState from "../common/EmptyState"
import { getAllProject } from "@/app/lib/fetch/project"
import type { Project, ProjectRole } from "@/app/types/domain"
import type { ColumnDef } from "@tanstack/react-table"

type ProjectAction = { link: string; label: string }
type ListedProject = Project & { action: ProjectAction[] }

function getProjectActions(role: ProjectRole | undefined, id: string): ProjectAction[] {
    const actions: ProjectAction[] = [{
        link: `/projects/${id}/team`,
        label: "Lihat Tim",
    }]

    if (role === "Owner") {
        actions.unshift({
            link: `/projects/${id}/setting`,
            label: "Pengaturan",
        })
    }

    return actions
}

export default function ProjectContent(){
    const [pageSize, setPageSize] = useState(10)
    const [query, setQuery] = useState("")
    const [projectData, setProjectData] = useState<ListedProject[] | null>(null)

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    const handlePageSizeChange = (value: number) => {
        setPageSize(value)
    }

    const handleSearch = (query: string) => {
        setQuery(query.toLowerCase())
    }

    useEffect(() => {
        let active = true
        void getAllProject()
            .then(projects => {
                if (!active) return
                if(projects.data) setProjectData(
                    projects.data.map(project => ({
                        ...project,
                        action: getProjectActions(project.projectRole, project.id)
                    }))
                )
                else alert("Gagal memperoleh data proyek")
            })
            .catch(() => {
                if (active) alert("Gagal memperoleh data proyek")
            })
        return () => { active = false }
    }, [])

    const columns: ColumnDef<ListedProject, unknown>[] = [
        {
            accessorKey: 'id',
        },
        {
            accessorKey: 'projectName',
            header: 'Nama Proyek',
            cell: ({ row }) => {
                const { id, projectName } = row.original
                return(
                    <Link
                        href={`/projects/${encodeURIComponent(id)}`}
                        className="w-full h-full block hover:underline text-basic-blue"
                    >
                        {projectName}
                    </Link>
                )
            }
        },
        {
            accessorKey: 'key',
            header: 'Kunci',
        },
        {
            accessorKey: 'createdBy',
            header: 'Owner',
            cell: ({ row }) => {
                const owner = row.original.createdBy
                const ownerDetails = owner && typeof owner === "object" ? owner : null
                const fullName = ownerDetails?.fullName
                const profileImage = ownerDetails?.profileImage
                const imageUrl = typeof profileImage === "string"
                    ? profileImage
                    : profileImage?.attachmentStoragePath
                return(
                    <div className="flex gap-2 items-center">
                        <UserIcon size="sm" fullName={fullName} src={imageUrl} alt=""/>
                        <p>{fullName?.split(' ')[0]}</p>
                    </div>
                )
            }
        },
        {
            accessorKey: 'action',
            header: () => <div className="w-full text-center">Aksi</div>,
            cell: ({ row }) => {
                return <TableActionButton actions={row.original.action} id={row.original.id}/>
            },
            enableSorting: false,
            size: 60
        },
    ]

    return(
        <div className="h-full overflow-y-auto flex flex-col mt-4 md:mt-6 gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6">
                    <SearchBar placeholder={"Cari proyek..."} handleSearch={handleSearch}/>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2">
                            <b className="hidden xs:block text-xs md:text-sm">Tampilkan:</b>
                            <SelectButton
                                name={"status-button"}
                                placeholder={pageSize}
                                options={pageSizeOptions}
                                onChange={handlePageSizeChange}
                            />
                        </div>
                    </div>
                </div>
                <LinkButton href="/projects/create">
                    Buat Proyek
                </LinkButton>
            </div>
            {projectData && projectData.length > 0 ?
            <Table
                data={projectData.filter(project => project.projectName.toLowerCase().includes(query))}
                columns={columns}
                pageSize={pageSize}
            /> :
            <EmptyState/>}
        </div>
    )
}
