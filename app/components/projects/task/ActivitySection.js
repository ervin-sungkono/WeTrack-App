"use client"
import { useEffect, useState } from "react"
import { sortDateFn, sortDateTimestampFn } from "@/app/lib/helper"
import dynamic from "next/dynamic"
import SortButton from "../../common/button/SortButton"
import { getQueryReference, getDocumentReference } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"

const CommentSection = dynamic(() => import("./CommentSection"))
const HistorySection = dynamic(() => import("./HistorySection"))

export default function ActivitySection({taskId}){
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
        if(!taskId) return
        const commentReference = getQueryReference({ collectionName: "comments", field: "taskId", id: taskId })
        const unsubscribeComments = onSnapshot(commentReference, async(snapshot) => {
            const updatedComments = await Promise.all(snapshot.docs.map(async(document) => {
                const userId = document.data().userId
                if(userId){
                    const userRef = getDocumentReference({ collectionName: "users", id: userId })
                    const userSnap = await getDoc(userRef)
                    const { fullName, profileImage } = userSnap.data()

                    return({
                        id: document.id,
                        user: {
                            fullName,
                            profileImage
                        },
                        ...document.data()
                    })
                }
                return({
                    id: document.id,
                    user: null,
                    ...document.data()
                })
            }))
            setCommentData(updatedComments)
        })

        const historyReference = getQueryReference({ collectionName: 'histories', field: 'taskId', id: taskId })
        const unsubscribeHistories = onSnapshot(historyReference, async(snapshot) => {
            const updatedHistories = await Promise.all(snapshot.docs.map(async(document) => ({
                    id: document.id,
                    ...document.data()
                })
            ))
            setHistoryData(updatedHistories)
        })
        
        return () => {
            unsubscribeComments()
            unsubscribeHistories()
        }
    }, [taskId])

    const getCategoryComponent = () => {
        if(category === "comment") return <CommentSection taskId={taskId} comments={commentData && sortDateFn({data: commentData, sortDirection: sorting})}/>
        if(category === "history") return <HistorySection histories={historyData &&  sortDateTimestampFn({data: historyData, sortDirection: sorting})}/>
        return null
    }

    return(
        <div className="flex flex-col gap-2 md:gap-4 min-h-[240px]">
            <div className="flex flex-col gap-2">
                <p className="font-semibold text-xs md:text-sm flex-grow">Aktivitas</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <p className="hidden xs:block text-xs md:text-sm">Tampilkan:</p>
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