'use client'
import Link from "next/link"
import WeTrackLogo from "../Logo"
import LinkButton from "../button/LinkButton"
import NavLink from "./NavLink"
import NavDropdown from "./NavDropdown"
import UserDropdown from "./UserDropdown"
import { useState } from "react"

import { 
    IoMdNotifications as NotificationIcon, 
    IoIosHelpCircle as HelpIcon,
} from "react-icons/io"

export default function NavbarMenu({ session, hideMenu }){
    const [hamburgerState, setHamburgerState] = useState(false)
    const user = { 
        fullName: "ervin cahyadinata sungkono",
        email: "ervin.sungkono@binus.ac.id"
    } // ini sementara sampai session jadi
    const projectLinks = [
        { label: 'Create a new project', url: '/projects/create' },
        { label: 'View all projects', url: '/projects' },
    ]

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
                            <NavDropdown label={"Projects"} dropdownLinks={projectLinks}>
                                <div className="py-2 flex flex-col gap-1">
                                    <p className="px-4 text-sm font-bold uppercase">Recent</p>
                                    <p className="px-4 text-xs text-dark-blue/80">You currently have no recent projects.</p>
                                </div>
                            </NavDropdown>
                            <NavLink label={"History"} href={"/history"}/>
                        </div> 
                        : 
                        null
                    }
                    <div className="lg:h-full flex items-center ml-auto">
                        {   
                            session ?
                            <div className="h-full flex items-center gap-2">
                                {/* Ini nanti dropdown */}
                                <div className="flex items-center py-4 lg:py-0">
                                    <Link href={"/notifications"} className="p-2 text-dark-blue hover:text-basic-blue transition-colors">
                                        <NotificationIcon size={24}/>
                                    </Link>
                                    <Link href={"/help"} className="p-2 text-dark-blue hover:text-basic-blue transition-colors">
                                        <HelpIcon size={24}/>
                                    </Link>
                                </div>
                                <UserDropdown {...user}/>
                            </div>
                            : 
                            <LinkButton
                                href="/login"
                                variant="secondary"
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