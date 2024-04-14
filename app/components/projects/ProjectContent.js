"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

import SearchBar from "../common/SearchBar"
import SelectButton from "../common/button/SelectButton"
import Table from "../common/table/Table"
import TableActionButton from "../common/table/TableActionButton"
import UserIcon from "../common/UserIcon"
import LinkButton from "../common/button/LinkButton"
import { getAllProject } from "@/app/lib/fetch/project"

export default function ProjectContent(){
    const [pageSize, setPageSize] = useState(10)
    const [query, setQuery] = useState("")
    const [projectData, setProjectData] = useState(null)

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    const handlePageSizeChange = (value) => {
        setPageSize(value)
    }

    const handleSearch = (query) => {
        setQuery(query.toLowerCase())
    }

    useEffect(() => {
        getAllProject()
            .then(projects => {
                if(projects.data) setProjectData(
                    projects.data.map(project => ({
                        ...project,
                        action: ['Sunting', 'Perbarui']
                    }))
                )
                else alert("Gagal memperoleh data proyek")
            })
    }, [])

    const columns = [
        {
            accessorKey: 'id',
        },
        {
            accessorKey: 'projectName',
            header: 'Nama Proyek',
            cell: ({ row }) => {
                const id = row.getValue('id')
                const projectName = row.getValue('projectName')
                return(
                    <Link 
                        href={`/projects/${id}`} 
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
                const { fullName, profileImage } = row.getValue('createdBy') ?? {}
                return(
                    <div className="flex gap-2 items-center">
                        <UserIcon size="sm" fullName={fullName} src={profileImage} alt=""/>
                        <p>{fullName?.split(' ')[0]}</p>
                    </div>
                )
            }
        },
        {
            accessorKey: 'action',
            header: () => <div className="w-full text-center">Aksi</div>,
            cell: ({ row }) => {
                const id = row.getValue("id")
                const actions = row.getValue("action")
                return <TableActionButton actions={actions} id={id}/>
            },
            enableSorting: false,
            size: 60
        },
    ]
    
    return(
        <div className="h-full flex flex-col mt-4 md:mt-6 gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6">
                    <SearchBar placeholder={"Cari proyek.."} handleSearch={handleSearch}/>
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
            <Table
                data={projectData?.filter(project => project.projectName.toLowerCase().includes(query))}
                columns={columns}
                pageSize={pageSize}
            />
        </div>
    )
}