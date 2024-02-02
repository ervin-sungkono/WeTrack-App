"use client"
import { useState } from "react";

import SidebarMenu from "./SidebarMenu";

import { 
    TbLayoutSidebarLeftCollapseFilled as SidebarCollapseIcon, 
    TbLayoutSidebarLeftExpandFilled as SidebarExpandIcon 
} from "react-icons/tb"

export default function Sidebar(){
    const [open, setOpen] = useState(true)
    const toggleSidebar = () => {
        setOpen(!open)
    }

    const baseUrl = '/dashboard'

    const mainLinks = [
        { 
            label: 'Overview',
            url: '/projects/{id}/overview', 
        },
        { 
            label: 'Timeline',
            url: '/projects/{id}/timeline', 
        },
        { 
            label: 'Board',
            url: '/projects/{id}/board', 
        },
        { 
            label: 'Issues',
            url: '/projects/{id}/issues', 
        },
        { 
            label: 'Team',
            url: '/projects/{id}/team', 
        },
    ]

    const settingLinks = [
        { 
            label: 'Project Settings',
            url: '/projects/{id}/setting', 
            type: 'single' 
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
            <div className={`w-full flex flex-col gap-4 px-4 pb-4 flex-grow transition-opacity ${open ? "opacity-100" : "opacity-0"} duration-300 overflow-x-hidden divide-gray-300`}>
                <SidebarMenu links={mainLinks} baseUrl={baseUrl}/>
                <hr className="border-dark-blue/30"/>
                <SidebarMenu links={settingLinks} baseUrl={baseUrl}/>
            </div>
        </section>
    )
}