"use client"

import { useEffect, useState } from "react"
import Header from "../common/Header"
import DashboardLayout from "../layout/DashboardLayout"
import DashboardInsight from "./DashboardInsight"
import DashboardTaskList from "./DashboardTaskList"
import { getAllProject } from "@/app/lib/fetch/project"
import { getAllTask } from "@/app/lib/fetch/task"
import PopUpLoad from "../common/alert/PopUpLoad"
import EmptyState from "../common/EmptyState"

export default function Dashboard(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Dasbor", url: "/dashboard"},
    ]

    const [loading, setLoading] = useState(true)
    const [projectsData, setProjectsData] = useState([])
    const [selectedProject, setSelectedProject] = useState([])

    useEffect(() => {
        getAllProject().then(projects => {
            if(projects.data){
                const tasks = projects.data.map(project => {
                    return getAllTask(project.id).then(tasks => {
                        tasks.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        project.tasks = tasks.data || []
                    })
                })
                Promise.all(tasks).then(() => {
                    projects.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    setProjectsData(projects.data)
                    setSelectedProject(projects.data[0])
                    setLoading(false)
                })
            }else{
                alert("Gagal memperoleh data proyek")
            }
        })
    }, [])

    if(loading){
        return (
            <PopUpLoad />
        )
    }else{
        return (
            <DashboardLayout>
                <div className="flex flex-col md:h-full">
                    <div className="flex flex-col gap-4">
                        <Header title={"Dasbor"} links={links}/>
                    </div>
                    {projectsData?.length > 0 ? (
                        <div className="flex flex-grow flex-col-reverse md:flex-row gap-4 w-full md:h-full md:overflow-y-auto mt-4 mb-8 md:mb-0">
                            <div className="w-full md:h-full md:w-1/2 md:overflow-y-auto custom-scrollbar">
                                <DashboardInsight project={selectedProject}/>
                            </div>
                            <div className="w-full md:h-full md:w-1/2 md:overflow-y-auto">
                                <DashboardTaskList list={projectsData} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-12 flex flex-col justify-center items-center text-center">
                            <EmptyState 
                                message={"Belum ada data proyek yang tersedia untuk ditampilkan dalam dasbor."}
                                action={"Buat Proyek Baru Sekarang"}
                                href={`/projects/create`}
                            />
                        </div>
                    )}    
                </div>
            </DashboardLayout> 
        )
    }
}