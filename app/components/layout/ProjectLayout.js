"use client"
import Navbar from "../common/navbar/Navbar"
import Sidebar from "../common/sidebar/Sidebar"
import { useSessionStorage } from "usehooks-ts"
import { useEffect, useState } from "react"
import { getProjectByID } from "@/app/lib/fetch/project"
import { useRouter } from "next/navigation"
import { getContentAuthorization } from "@/app/firebase/util"
import PopUpLoad from "../common/alert/PopUpLoad"
import { RoleProvider } from "@/app/lib/context/role"

export default function ProjectLayout({ children, hideSidebar, projectId }){
    const [project, setProject] = useSessionStorage('project')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const comapareObject = (newObj, oldObj) => {
        if(!oldObj || Object.keys(oldObj).length == 0) return true

        let diff = {}
        for (const key in oldObj) {
            if (newObj[key] && oldObj[key] != newObj[key] ) {
                diff[key] = newObj[key]; 
            }
        }

        if (Object.keys(diff).length > 0) 
            return true;

        return false
    }

    useEffect(() => {
        const fetchProjectDetail = async() => {
            setLoading(true)
            try{
                const authorized = await getContentAuthorization({ projectId })
                if(authorized){
                    const projectData = await getProjectByID(projectId)
                    if(projectData.data && comapareObject(projectData.data, project)){
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
                console.log(e)
                setLoading(false)
            }
        }
        if(projectId){
            fetchProjectDetail()
        }
    }, [projectId])

    if(loading){
        return (
            <div className="flex fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
                <PopUpLoad/>
            </div>
        )
    }
    
    return(
        <RoleProvider>
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