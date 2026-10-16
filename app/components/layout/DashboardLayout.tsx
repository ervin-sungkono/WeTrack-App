import type { ReactNode } from "react"
import Navbar from "../common/navbar/Navbar"

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps){
    return(
        <div className="flex fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
            <Navbar/>
            <main className="container py-6 md:py-8 max-h-full mx-auto flex flex-col overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
