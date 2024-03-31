'use client'
import dynamic from "next/dynamic"
import moment from "moment"
import Link from "next/link"
import WeTrackLogo from "../Logo"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { getRecentProjects } from "@/app/lib/fetch/project"
import SkeletonText from "../../skeleton/SkeletonText"
import Button from "../button/Button"

import { 
    IoMdNotifications as NotificationIcon, 
    IoIosHelpCircle as HelpIcon,
} from "react-icons/io"

const NavLink = dynamic(() => import("./NavLink"))
const NavDropdown = dynamic(() => import("./NavDropdown"))
const UserDropdown = dynamic(() => import("./UserDropdown"))
const LinkButton = dynamic(() => import("../button/LinkButton"))

export default function NavbarMenu({ showForm, hideMenu }){
    const [hamburgerState, setHamburgerState] = useState(false)
    const { data: session, status } = useSession()
    const [recentProjects, setRecentProjects] = useState(null)

    const projectLinks = [
        { label: 'Create a new project', url: '/projects/create' },
        { label: 'View all projects', url: '/projects' },
    ]

    useEffect(() => {
        getRecentProjects()
            .then(projects => {
                if(projects.data) setRecentProjects(projects.data)
                else alert("Fail to get projects data")
            })
    }, [])

    if(status == 'loading'){
        return (
            <div className="w-full flex items-center gap-12">
                <SkeletonText width={150} height={32} rounded/>
                <div className="hidden md:block ml-auto">
                    <SkeletonText width={160} height={40} rounded/>
                </div>
            </div>
        )
    }

    return(
        <>
            <div className="flex w-full h-full items-center gap-6 md:gap-8">
                <Link href={"/"}>
                    <WeTrackLogo/>
                </Link>
                <div className={`nav-menu h-full flex-grow flex justify-between items-center 
                    ${hamburgerState ? 'active' : ''}`}
                >
                    {   
                        (session && !hideMenu) ?
                        <div className={`w-full lg:w-auto flex flex-col lg:flex-row lg:h-full items-center`}>
                            <NavLink label={"Dashboard"} href={"/dashboard"}/>
                            <NavDropdown label={"Projects"} baseLink={'/projects'} dropdownLinks={projectLinks}>
                                <div className="py-2 flex flex-col gap-1">
                                    <p className="px-4 text-sm font-bold uppercase">Recent</p>
                                    {
                                        (recentProjects && recentProjects.length > 0) ? 
                                        recentProjects.map(project => (
                                            <Link href={`/projects/${project.id}`} key={project.id}>
                                                <div className="px-4 py-2 hover:bg-gray-100 flex flex-col gap-0.5">
                                                    <p className="text-xs md:text-sm font-semibold">{project.projectName}</p>
                                                    <p className="text-[10.8px] text-xs text-dark-blue/80">{moment.unix(project.createdAt.seconds).format("DD MMM YYYY")}</p>
                                                </div>
                                            </Link>
                                        )) :
                                        <p className="px-4 text-xs text-dark-blue/80">You currently have no recent projects.</p>
                                    }
                                </div>
                            </NavDropdown>
                            <NavLink label={"History"} href={"/history"}/>
                            <Button variant="primary" size="md" className={"w-full mt-2 lg:mt-0 lg:ml-4"} onClick={showForm}>Create</Button>
                        </div> 
                        : 
                        null
                    }
                    <div className="lg:h-full flex items-center ml-auto">
                        {   
                            session ?
                            <div className="h-full flex items-center gap-2">
                                <div className="flex items-center py-4 lg:py-0">
                                    <Link href={"/notifications"} className="p-2 text-dark-blue hover:text-basic-blue transition-colors">
                                        <NotificationIcon size={24}/>
                                    </Link>
                                    <Link href={"/help"} className="p-2 text-dark-blue hover:text-basic-blue transition-colors">
                                        <HelpIcon size={24}/>
                                    </Link>
                                </div>
                                <UserDropdown {...session.user}/>
                            </div>
                            : 
                            <LinkButton
                                href="/login"
                                variant="primary"
                                outline
                            >
                                Sign In
                            </LinkButton>
                        }
                    </div>
                </div>
            </div>
            <button
                className={`hamburger-btn ${hamburgerState ? 'active': ''}`}
                onClick={() => setHamburgerState(!hamburgerState)}
            >
                <div></div>
                <div></div>
                <div></div>
            </button>
        </>
    )
}