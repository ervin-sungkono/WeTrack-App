"use client"
import { useState } from "react"

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

export default function Sidebar(){
    const [open, setOpen] = useState(true)
    const toggleSidebar = () => {
        setOpen(!open)
    }

    const baseUrl = '/projects/{id}'

    const mainLinks = [
        { 
            label: 'Overview',
            url: '/projects/{id}/overview',
            icon: <OverviewIcon size={16}/>
        },
        { 
            label: 'Timeline',
            url: '/projects/{id}/timeline', 
            icon: <TimelineIcon size={16}/>
        },
        { 
            label: 'Board',
            url: '/projects/{id}/board', 
            icon: <BoardIcon size={16}/>
        },
        { 
            label: 'Issues',
            url: '/projects/{id}/issues', 
            icon: <IssueIcon size={16}/>
        },
        { 
            label: 'Team',
            url: '/projects/{id}/team', 
            icon: <TeamIcon size={16}/>
        },
    ]

    const settingLinks = [
        { 
            label: 'Project Settings',
            url: '/projects/{id}/setting', 
            icon: <SettingIcon size={16}/>
        },
    ]

    return(
        <section className={`sidebar relative ${open ? "w-[240px]" : "w-20 "} bg-white flex-shrink-0 h-full flex flex-col shadow-md z-[10000] transition-all duration-300 ease-in-out`}>
            <div className="w-full flex justify-between items-center px-4 pt-6 pb-4">  
                <div className="text-sm md:text-base text-center font-semibold whitespace-nowrap overflow-hidden transition-[width] duration-300" style={{width: (open ? "100%" : "0px")}}>Project Name</div>
                <button className="absolute top-4 right-0 translate-x-1/2 text-white bg-basic-blue hover:bg-light-blue p-2.5 rounded-full transition-colors" onClick={toggleSidebar}>
                    {open ? <SidebarCollapseIcon size={20}/> : <SidebarExpandIcon size={20}/>}
                </button>
            </div>
            <div className={`w-full flex flex-col gap-4 px-4 pb-4 flex-grow transition-opacity duration-300 overflow-x-hidden divide-gray-300`}>
                <SidebarMenu links={mainLinks} baseUrl={baseUrl} open={open}/>
                <hr className="border-dark-blue/30"/>
                <SidebarMenu links={settingLinks} baseUrl={baseUrl} open={open}/>
            </div>
        </section>
    )
}