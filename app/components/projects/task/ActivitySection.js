"use client"
import { useEffect, useState } from "react"
import { sortDateFn } from "@/app/lib/helper"
import dynamic from "next/dynamic"
import SortButton from "../../common/button/SortButton"

const CommentSection = dynamic(() => import("./CommentSection"))
const HistorySection = dynamic(() => import("./HistorySection"))

export default function ActivitySection(){
    const [category, setCategory] = useState("comment")
    const categoryList = [
        {
            label: "Komentar",
            value: "comment"
        }, 
        {
            label: "Riwayat",
            value: "history"
        }
    ]

    const [commentData, setCommentData] = useState(null)
    const [historyData, setHistoryData] = useState(null)
    const [sorting, setSorting] = useState('asc')

    useEffect(() => {
        if(category === "comment" && !commentData){
            // get comment data
            setCommentData([
                {   
                    id: "CM001",
                    taskId: "TS001",
                    userId: "WeEzNxSREEdyDpSXkIYCAyA4E8y1",
                    commentText: "Testing Comment 1",
                    createdAt: new Date("2024-01-17"),
                },
                {   
                    id: "CM002",
                    taskId: "TS001",
                    userId: "AAOO2",
                    commentText: "Testing Comment 2",
                    createdAt: new Date("2024-01-18"),
                }
            ])
        }
        if(category === "history" && !historyData){
            // get comment data
            setHistoryData([
                {   
                    id: "HI001",
                    user: {
                        id: "AAOO1",
                        fullName: "Ervin Cahyadinata Sungkono",
                        profileImage: null
                    },
                    task: {
                        id: "TS001",
                        taskName: "Creating Landing Page"
                    },
                    project: {
                        id: "PO001",
                        projectName: "Company Profile"
                    },
                    eventType: "Tugas",
                    action: "create", // create, add, update, delete
                    previousValue: null,
                    newValue: null,
                    description: "",
                    createdAt: new Date("2024-01-15")
                },
                {   
                    id: "HI002",
                    user: {
                        id: "AAOO1",
                        fullName: "Ervin Cahyadinata Sungkono",
                        profileImage: null
                    },
                    task: {
                        id: "TS001",
                        taskName: "Creating Landing Page"
                    },
                    project: {
                        id: "PO001",
                        projectName: "Company Profile"
                    },
                    eventType: "Nama Tugas",
                    action: "update", // create, add, update, delete
                    previousValue: "Create Landing Page",
                    newValue: "Develop Landing Page",
                    description: "",
                    createdAt: new Date("2024-01-16")
                },
            ])
        }
    }, [category, commentData, historyData])

    const getCategoryComponent = () => {
        if(category === "comment") return <CommentSection comments={commentData && sortDateFn({data: commentData, sortDirection: sorting})}/>
        if(category === "history") return <HistorySection histories={historyData && sortDateFn({data: historyData, sortDirection: sorting})}/>
        return null
    }

    return(
        <div className="flex flex-col gap-2 md:gap-4 min-h-[240px]">
            <div className="flex flex-col gap-2">
                <p className="font-semibold text-xs md:text-sm flex-grow">Aktivitas</p>
                <div className="flex justify-between">
                    <div className="flex items-center gap-2.5">
                        <p className="text-xs md:text-sm">Tampilkan:</p>
                        <div className="flex gap-2">
                            {categoryList.map(({label, value}) => (
                                <button 
                                    key={value}
                                    className={`font-medium text-xs rounded py-1 px-2  ${category === value ? "bg-light-blue" : "bg-gray-200 hover:bg-light-blue"} text-dark-blue  transition-colors duration-300`}
                                    onClick={() => setCategory(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SortButton sorting={sorting} setSorting={setSorting}/>
                </div>
            </div>
            {getCategoryComponent()}
        </div>
    )
}