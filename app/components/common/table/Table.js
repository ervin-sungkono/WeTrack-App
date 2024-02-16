"use client"
import { useEffect, useMemo } from 'react'
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
} from '@tanstack/react-table'
import TablePagination from './TablePagination'

import { FaSort as SortIcon, FaSortUp as SortIconUp, FaSortDown as SortIconDown } from 'react-icons/fa'
import { RevolvingDot } from "react-loader-spinner"

export default function Table({
    data, 
    columns, 
    sorting, 
    setSorting,
    pagination,
    pageSize = 10,
    setPagination,
    pageCount,
}){
    const memoizedData = useMemo(() => data, [data])
    const memoizedColumns = useMemo(() => columns, [columns])

    const hasPrevPage = pagination.pageIndex > 1
    const hasNextPage = (pagination.pageIndex + 1) < pageCount

    const { 
        getHeaderGroups, 
        getRowModel, 
        setPageIndex, 
        setPageSize
    } = useReactTable({
        data: memoizedData,
        columns: memoizedColumns,
        defaultColumn: {
            size: 260
        },
        state: {
            sorting,
            pagination,
            columnVisibility: {
                Id: false
            }
        },
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        onSortingChange: setSorting,
        manualPagination: true,
        onPaginationChange: setPagination,
        pageCount: pageCount ?? -1,
    })

    useEffect(() => {
        if(setPageSize){
            setPageSize(pageSize)
        }
    }, [setPageSize, pageSize])

    const handlePageChange = (page) => {
        if(page > 0 && page <= pageCount)
        setPageIndex(page)
    }

    if(!data){
        return (
            <div className='w-full h-full flex flex-col gap-4 justify-center items-center'>
                <RevolvingDot
                    height="100"
                    width="100"
                    radius="48"
                    color="#4fa94d"
                />
                <p className='text-sm md:text-base text-dark/80'>Loading Table Data...</p>
            </div>
        )
    }
    return(
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className='h-full overflow-auto'>
                <table className='w-full table-fixed'>
                    <thead className='sticky top-0 z-40'>
                        {getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className='border-b border-b-dark-blue/20' >
                                {headerGroup.headers.map((header, index) => (
                                    <th 
                                        key={header.id}
                                        scope='col'
                                        className='text-left text-dark-blue/80 whitespace-nowrap z-fixed'
                                        style={{
                                            width: header.getSize()
                                        }}
                                    >
                                        {header.isPlaceholder ? 
                                        null : 
                                        (<div  {...{
                                            className: `${header.column.getCanSort()
                                              ? "w-full select-none cursor-pointer"
                                              : ""} px-2.5 py-2.5 text-xs md:text-sm flex justify-between items-center gap-1.5 z-fixed`,
                                            onClick: header.column.getToggleSortingHandler(),
                                          }}>
                                           {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() ? {
                                                asc: <SortIconUp className='text-dark-blue/80' size={16}/>,
                                                desc: <SortIconDown className='text-dark-blue/80' size={16}/>,
                                            }[header.column.getIsSorted()] ?? <SortIcon size={16} className='text-dark-blue/60'/> : null}
                                        </div>)}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {getRowModel().rows.map((row )=> (
                            <tr key={row.id} className={`border-b border-b-dark-blue/20`}>
                                {row.getVisibleCells().map(cell => (
                                    <td 
                                        key={cell.id} 
                                        className={`text-dark`}
                                    >
                                        <div className={'px-2.5 py-2.5 text-xs md:text-sm'}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <TablePagination 
                {...pagination}
                handlePageChange={handlePageChange}
                hasPrevPage={hasPrevPage}
                hasNextPage={hasNextPage}
                totalCount={data.length}
            />
        </div>
    )
}