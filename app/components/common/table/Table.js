"use client"
import { useEffect, useMemo } from 'react'
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import TablePagination from './TablePagination'

import { FaSort as SortIcon, FaSortUp as SortIconUp, FaSortDown as SortIconDown } from 'react-icons/fa'
import { RevolvingDot } from "react-loader-spinner"

export default function Table({
    data, 
    columns, 
    pageSize = 10,
    usePagination = true,
    fullWidth = true,
    sortable = true,
}){
    const memoizedData = useMemo(() => data, [data])
    const memoizedColumns = useMemo(() => columns, [columns])

    const { 
        getState,
        getHeaderGroups, 
        getRowModel, 
        nextPage,
        previousPage,
        getPageCount,
        getCanPreviousPage,
        getCanNextPage, 
        setPageSize,
        setPageIndex
    } = useReactTable({
        data: memoizedData,
        columns: memoizedColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        defaultColumn: {
            size: 240
        },
        state: {
            columnVisibility: {
                id: false
            }
        },
        getCoreRowModel: getCoreRowModel(),
    })

    useEffect(() => {
        if(setPageSize){
            setPageSize(pageSize)
        }
    }, [setPageSize, pageSize])

    if(!data){
        return (
            <div className='w-full h-full flex flex-col gap-4 justify-center items-center'>
                <RevolvingDot
                    height="100"
                    width="100"
                    radius="48"
                    color="#47389F"
                />
                <p className='text-sm md:text-base text-dark/80'>Memuat data tabel...</p>
            </div>
        )
    }
    return(
        <div className="h-full max-h-full flex flex-col gap-4 overflow-hidden">
            <div className='overflow-auto'>
                <table className={`${fullWidth ? "w-full" : ""} table-fixed`}>
                    <thead className='sticky top-0 z-40 bg-white'>
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
                                            className: `${sortable && header.column.getCanSort()
                                              ? "w-full select-none cursor-pointer"
                                              : ""} px-2.5 py-2 text-xs md:text-sm flex justify-between items-center gap-1.5 z-fixed`,
                                            onClick: sortable ? header.column.getToggleSortingHandler() : undefined,
                                          }}>
                                           {flexRender(header.column.columnDef.header, header.getContext())}
                                            {sortable && header.column.getCanSort() ? {
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
                                        <div className={'px-2.5 py-2 text-xs md:text-sm'}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {usePagination && <TablePagination 
                {...getState().pagination}
                hasPrevPage={getCanPreviousPage()}
                hasNextPage={getCanNextPage()}
                nextPage={nextPage}
                previousPage={previousPage}
                firstPage={() => setPageIndex(0)}
                lastPage={() => setPageIndex(getPageCount() - 1)}
                totalCount={data.length}
            />}
        </div>
    )
}