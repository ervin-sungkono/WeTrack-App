"use client"
import Navbar from "../common/navbar/Navbar"
import Sidebar from "../common/sidebar/Sidebar"
import useSessionStorage from "@/app/lib/hooks/useSessionStorage"
import { useEffect } from "react"
import { getProjectByID } from "@/app/lib/fetch/project"

export default function ProjectLayout({ children, hideSidebar, projectId }){
    const [project, setProject] = useSessionStorage('project', null)
    useEffect(() => {
        if(projectId && (!project || project.id != projectId)){
            getProjectByID(projectId)
            .then(project => {
                if(project.data) setProject(project.data)
                else alert("Gagal memperoleh rincian proyek")
            })
        }
    }, [project, projectId])
    
    return(
        <div className="flex fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
            <Navbar/>
            {!hideSidebar && <Sidebar project={project}/>}
            <div className="max-w-7xl max-h-full flex flex-col flex-grow gap-6 pt-6 pb-6 md:pb-8 pl-10 xs:pl-12 lg:pl-14 pr-6 lg:pr-12 mx-auto overflow-y-auto">
                <main className="flex-grow flex flex-col gap-4 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}