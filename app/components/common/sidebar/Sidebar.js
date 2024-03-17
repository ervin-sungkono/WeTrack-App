"use client"
import { useEffect, useState } from "react"

import SidebarMenu from "./SidebarMenu"

import { 
    TbLayoutSidebarLeftCollapseFilled as SidebarCollapseIcon, 
    TbLayoutSidebarLeftExpandFilled as SidebarExpandIcon 
} from "react-icons/tb"

import { 
    MdViewComfy as OverviewIcon ,
    MdViewTimeline as TimelineIcon,
    MdViewKanban as BoardIcon,
    MdTask as IssueIcon,
    MdGroup as TeamIcon,
    MdSettings as SettingIcon
} from "react-icons/md"

export default function Sidebar({ project }){
    const [open, setOpen] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [baseUrl, setBaseUrl] = useState("/")

    useEffect(() => {
        setMounted(true)
        if(project) {
            setBaseUrl(`/projects/${project.id}`)
        }
    }, [project])

    const toggleSidebar = () => {
        setOpen(!open)
    }

    const mainLinks = [
        { 
            label: 'Overview',
            url: '/',
            icon: <OverviewIcon size={16}/>
        },
        { 
            label: 'Timeline',
            url: '/timeline', 
            icon: <TimelineIcon size={16}/>
        },
        { 
            label: 'Board',
            url: '/board', 
            icon: <BoardIcon size={16}/>
        },
        { 
            label: 'Issues',
            url: '/issues', 
            icon: <IssueIcon size={16}/>
        },
        { 
            label: 'Team',
            url: '/team', 
            icon: <TeamIcon size={16}/>
        },
    ]

    const settingLinks = [
        { 
            label: 'Project Settings',
            url: '/setting', 
            icon: <SettingIcon size={16}/>
        },
    ]

    if(!mounted) return (
        <section className={`sidebar fixed lg:relative w-[200px] lg:translate-x-0 ${open ? "lg:w-[240px] translate-x-0" : "lg:w-20 -translate-x-full"} bg-white flex-shrink-0 h-full flex flex-col shadow-md z-fixed`}>
        </section>
    )

    return (
        <section className={`sidebar fixed lg:relative w-[200px] lg:translate-x-0 ${open ? "lg:w-[240px] translate-x-0" : "lg:w-20 -translate-x-full"} bg-white flex-shrink-0 h-full flex flex-col shadow-md z-fixed transition-all duration-300 ease-in-out`}>
            <div className="w-full flex justify-between items-center px-4 pt-4 lg:pt-6 pb-2.5 md:pb-4">  
                <div className="text-base md:text-lg text-center font-semibold whitespace-nowrap overflow-hidden transition-[width] duration-300" style={{width: (open ? "100%" : "0px")}}>
                    {project?.projectName}
                </div>
                <button className="absolute top-2 lg:top-4 -right-6 lg:right-0 translate-x-1/2 text-white bg-basic-blue hover:bg-light-blue p-2.5 rounded-full transition-colors" onClick={toggleSidebar}>
                    {open ? <SidebarCollapseIcon size={20}/> : <SidebarExpandIcon size={20}/>}
                </button>
            </div>
            <div className={`w-full flex flex-col gap-4 pb-4 px-4 flex-grow transition-opacity duration-300 overflow-x-hidden divide-gray-300`}>
                <SidebarMenu links={mainLinks} baseUrl={baseUrl} open={open}/>
                <hr className="border-dark-blue/30"/>
                <SidebarMenu links={settingLinks} baseUrl={baseUrl} open={open}/>
            </div>
        </section>
    )
}