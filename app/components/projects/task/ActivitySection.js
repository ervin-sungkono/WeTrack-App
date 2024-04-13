"use client"
import { useState } from "react"
import dynamic from "next/dynamic"

const CommentSection = dynamic(() => import("./CommentSection"))
const HistorySection = dynamic(() => import("./HistorySection"))

export default function ActivitySection(){
    const [active, setActive] = useState("comment")

    return(
        <div>Activity</div>
    )
}