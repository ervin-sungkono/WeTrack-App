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
import { getDocumentReference, getQueryReference } from "@/app/firebase/util"
import { getDoc, onSnapshot } from "firebase/firestore"
import { getUserProfile } from "@/app/lib/fetch/user"

export default function Dashboard(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Dasbor", url: "/dashboard"},
    ]

    const [userId, setUserId] = useState(null)

    useEffect(() => {
        getUserProfile().then((res) => {
            if(res.error){
                console.log(res.error)
            }else{
                setUserId(res.data.uid)
            }
        })
    }, [])

    const [loading, setLoading] = useState(true)
    const [projectsData, setProjectsData] = useState([])
    const [selectedProject, setSelectedProject] = useState([])

    useEffect(() => {
        const reference = getQueryReference({ collectionName: "teams", field: "userId", id: userId })
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const filteredProjects = snapshot.docs.filter(doc => {
                const role = doc.data().role
                const status = doc.data().status
                return role !== "Viewer" && status !== "pending"
            })

            const projects = await Promise.all(filteredProjects.map(async(doc) => {
                const projectRole = doc.data().role
                const projectId = doc.data().projectId
                if(projectId){
                    const projectRef = getDocumentReference({collectionName: "projects", id: projectId})
                    const projectSnap = await getDoc(projectRef)
                    const projectData = projectSnap.data()
                    const startStatusRef = getDocumentReference({collectionName: "taskStatuses", id: projectData.startStatus})
                    const startStatusSnap = await getDoc(startStatusRef)
                    projectData.startStatus = startStatusSnap.data().statusName
                    const endStatusRef = getDocumentReference({collectionName: "taskStatuses", id: projectData.endStatus})
                    const endStatusSnap = await getDoc(endStatusRef)
                    projectData.endStatus = endStatusSnap.data().statusName
                    const tasks = await getAllTask(projectId)
                    tasks.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    const assignedTasks = tasks.data.filter(task => task.assignedTo === userId)
                    projectData.tasks = assignedTasks
                    return {
                        id: projectId,
                        role: projectRole,
                        ...projectData
                    }
                }
            }))
            const projectWithTasks = projects.filter(project => project.tasks.length > 0)
            setProjectsData(projectWithTasks)
            setSelectedProject(projectWithTasks[0])
            setLoading(false)
        })
        return () => unsubscribe()
    }, [userId])

    // METHOD LAMA

    // useEffect(() => {
    //     if(!userId) return
    //     getAllProject().then(projects => {
    //         if(projects.data){
    //             const tasks = projects.data.map(project => {
    //                 const startStatusRef = getDocumentReference({collectionName: "taskStatuses", id: project.startStatus})
    //                 const startStatusSnap = getDoc(startStatusRef)
    //                 startStatusSnap.then(doc => {
    //                     project.startStatus = doc.data().statusName
    //                 })
    //                 const endStatusRef = getDocumentReference({collectionName: "taskStatuses", id: project.endStatus})
    //                 const endStatusSnap = getDoc(endStatusRef)
    //                 endStatusSnap.then(doc => {
    //                     project.endStatus = doc.data().statusName
    //                 })
    //                 return getAllTask(project.id).then(tasks => {
    //                     tasks.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    //                     const assignedTasks = tasks.data.filter(task => task.assignedTo === userId)
    //                     project.tasks = assignedTasks || []
    //                 })
    //             })
    //             Promise.all(tasks).then(() => {
    //                 projects.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    //                 setProjectsData(projects.data)
    //                 setSelectedProject(projects.data[0])
    //                 setLoading(false)
    //             })
    //         }else{
    //             alert("Gagal memperoleh data proyek")
    //         }
    //     })
    // }, [userId])

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
                    {projectsData && projectsData?.length > 0 ? (
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