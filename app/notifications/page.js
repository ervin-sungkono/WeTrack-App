"use client"
import { SessionProvider } from "next-auth/react"
import Notifications from "../components/notifications/Notifications"

export default function NotificationsPage(){
    return (
        <SessionProvider>
            <Notifications />
        </SessionProvider>
    )
}