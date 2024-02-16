"use client"
import { useEffect, useState } from "react"

import SearchBar from "../common/SearchBar"
import SelectButton from "../common/SelectButton"
import Table from "../common/table/Table"
import TableActionButton from "../common/table/TableActionButton"
import UserIcon from "../common/UserIcon"
import LinkButton from "../common/button/LinkButton"

export default function ProjectContent(){
    const [sorting, setSorting] = useState([])
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10
    })
    const [pageSize, setPageSize] = useState(10)
    const [query, setQuery] = useState("")
    const [projectData, setProjectData] = useState(null)

    const pageSizeOptions = [
        {label: "5", value: 5},
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50}
    ]

    const handlePageSizeChange = (value) => {
        setPageSize(value)
    }

    const handleSearch = (query) => {
        setQuery(query)
    }

    useEffect(() => {
        const projectData = []
        for(let i = 0; i < 50; i++){
            projectData.push({
                Id: i,
                ProjectName: `${i}-New Project`,
                Key: `NP${i}`,
                CreatedBy: 'userId',
                action: ['Edit', 'Delete']
            })
        }
        setProjectData(projectData)
    }, [])

    const columns = [
        {
            accessorKey: 'Id',
        },
        {
            accessorKey: 'ProjectName',
            header: 'Project Name',
        },
        {
            accessorKey: 'Key',
            header: 'Key',
        },
        {
            accessorKey: 'CreatedBy',
            header: 'Owner',
            cell: ({ row }) => {
                const userId = row.getValue('CreatedBy')
                const userName = "ervin cahyadinata sungkono" // TODO: Fetch API dari sini
                return(
                    <div className="flex gap-2 items-center">
                        <UserIcon size="sm" fullName={userName}/>
                        <p>{userName.split(' ')[0]}</p>
                    </div>
                )
            }
        },
        {
            accessorKey: 'action',
            header: () => <div className="w-full text-center">Action</div>,
            cell: ({ row }) => {
                const id = row.getValue("Id")
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
                <div className="w-full flex justify-center items-center gap-3 md:gap-6">
                    <SearchBar placeholder={"Search project.."} handleSearch={handleSearch}/>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2">
                            <b className="hidden xs:block text-xs md:text-sm">Show:</b>
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
                    Create Project
                </LinkButton>
            </div>
            <Table
                data={projectData?.filter(project => project.ProjectName.includes(query))}
                columns={columns}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
                pageSize={pageSize}
            />
        </div>
    )
}