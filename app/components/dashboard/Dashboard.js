"use client"

import { useEffect, useState } from "react"
import Header from "../common/Header"
import DashboardLayout from "../layout/DashboardLayout"
import DashboardInsight from "./DashboardInsight"
import DashboardTaskList from "./DashboardTaskList"
import { getAllProject, getProjectByID } from "@/app/lib/fetch/project"
import PopUpLoad from "../common/alert/PopUpLoad"

export default function Dashboard(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Dasbor", url: "/dashboard"},
    ]

    const [loading, setLoading] = useState(true)
    const [projectsData, setProjectsData] = useState(null)
    const [selectedProject, setSelectedProject] = useState(null)

    useEffect(() => {
        getAllProject().then(projects => {
            if(projects.data){
                setProjectsData(projects.data)
                setSelectedProject(projects.data[0])
                for(let i = 0; i < projects.data.length; i++){
                    getProjectByID(projects.data[i].id).then(project => {
                        if(project.data){
                            console.log(project.data)
                        }else{
                            alert("Gagal memperoleh data proyek")
                        }
                    })
                }
                setLoading(false)
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
                <div className="flex flex-col gap-4">
                    <Header title={"Dasbor"} links={links}/>     
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
                    <div className="w-full md:w-1/2">
                        <DashboardInsight project={selectedProject}/>
                    </div>
                    <div className="w-full md:w-1/2">
                        <DashboardTaskList list={projectsData} />
                    </div>
                </div>
            </DashboardLayout> 
        )
    }
}