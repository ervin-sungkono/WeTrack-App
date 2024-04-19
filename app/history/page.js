"use client"
import { SessionProvider } from "next-auth/react"
import History from "../components/history/History"

export default function HistoryPage(){
    return (
        <SessionProvider>
            <History />
        </SessionProvider>
    )
}