"use client"
import type { ReactNode } from "react"
import Navbar from "../common/navbar/Navbar"
import Sidebar from "../common/sidebar/Sidebar"
import { useSessionStorage } from "usehooks-ts"
import { useEffect, useState } from "react"
import { getProjectByID } from "@/app/lib/fetch/project"
import { useRouter } from "next/navigation"
import { getContentAuthorization } from "@/app/firebase/util"
import PopUpLoad from "../common/alert/PopUpLoad"
import { RoleProvider } from "@/app/lib/context/role"
import type { Project } from "@/app/types/domain"

type ProjectSession = Pick<Project, "id" | "key" | "projectName" | "startStatus" | "endStatus">

interface ProjectLayoutProps {
    children: ReactNode
    hideSidebar?: boolean
    projectId: string
}

export default function ProjectLayout({ children, hideSidebar = false, projectId }: ProjectLayoutProps){
    const [project, setProject] = useSessionStorage<ProjectSession | null>('project', null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const compareProject = (newProject: ProjectSession, oldProject: ProjectSession | null) => {
        if(!oldProject || Object.keys(oldProject).length === 0) return true

        return Object.entries(newProject).some(([key, value]) =>
            value !== undefined && oldProject[key as keyof ProjectSession] !== value
        )
    }

    useEffect(() => {
        let active = true
        const fetchProjectDetail = async() => {
            if(!project || (project.id != projectId)) setLoading(true)
            try{
                const authorized = await getContentAuthorization({ projectId })
                if (!active) return
                if(authorized){
                    const projectData = await getProjectByID(projectId)
                    if (!active) return
                    if(projectData.data && compareProject(projectData.data, project)){
                        const { id, key, projectName, startStatus, endStatus } = projectData.data
                        setProject({
                            id,
                            key,
                            projectName,
                            startStatus,
                            endStatus
                        })
                    }
                    else if(!projectData.data) {
                        console.log("Gagal mendapatkan rincian proyek")
                        router.replace('/projects')
                    }
                    setLoading(false)
                }else{
                    router.replace('/projects')
                }
            }catch(e){
                if (active) {
                    console.error("Failed to load project details", e)
                    setLoading(false)
                }
            }
        }
        if(projectId){
            fetchProjectDetail()
        }
        return () => { active = false }
    }, [project, projectId, router, setProject])

    if(loading){
        return (
            <div className="flex fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
                <PopUpLoad/>
            </div>
        )
    }

    return(
        <RoleProvider projectId={projectId}>
            <div className="flex fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
                <Navbar/>
                {!hideSidebar && <Sidebar project={project} projectId={projectId}/>}
                <div className="max-w-7xl max-h-full flex flex-col flex-grow gap-6 pt-6 pb-6 md:pb-8 pl-10 xs:pl-12 lg:pl-14 pr-6 lg:pr-12 mx-auto overflow-y-auto">
                    <main className="flex-grow flex flex-col gap-2.5 md:gap-4 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </RoleProvider>
    )
}
