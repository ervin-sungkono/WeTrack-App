"use client"
import { useEffect, useState } from "react"

import SearchBar from "../common/SearchBar"
import SelectButton from "../common/SelectButton"
import Table from "../common/table/Table"
import TableActionButton from "../common/table/TableActionButton"
import UserIcon from "../common/UserIcon"

export default function ProjectContent(){
    const [sorting, setSorting] = useState([])
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10
    })
    const [pageSize, setPageSize] = useState(10)
    const [projectData, setProjectData] = useState(null)

    const pageSizeOptions = [
        {label: "10", value: 10},
        {label: "25", value: 25},
        {label: "50", value: 50},
        {label: "100", value: 100}
    ]

    const handlePageSizeChange = (value) => {
        console.log(value)
    }

    const handleSearch = (query) => {
        console.log(query)
    }

    useEffect(() => {
        setProjectData([
            {
                Id: 1,
                ProjectName: 'New Project',
                Key: 'NP',
                CreatedBy: 'userId',
                action: ['Edit', 'Delete']
            },
        ])
    }, [])

    const columns = [
        {
            accessorKey: 'ProjectName',
            header: 'Name',
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
            size: 48
        },
    ]
    
    return(
        <div className="h-full flex flex-col mt-4 md:mt-6 gap-4">
            <div className="flex items-center gap-3 md:gap-6">
                <SearchBar placeholder={"Search task.."} handleSearch={handleSearch}/>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2">
                        <b className="text-sm">Show:</b>
                        <SelectButton 
                            name={"status-button"}
                            placeholder={pageSize} 
                            options={pageSizeOptions} 
                            onChange={handlePageSizeChange}
                        />
                    </div>
                </div>
            </div>
            <Table
                data={projectData}
                columns={columns}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
            />
        </div>
    )
}