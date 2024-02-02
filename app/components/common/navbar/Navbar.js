import Link from "next/link"
import WeTrackLogo from "../Logo"
import LinkButton from "../button/LinkButton"
import NavLink from "./NavLink"
import NavDropdown from "./NavDropdown"
import UserDropdown from "./UserDropdown"

import { 
    IoMdNotifications as NotificationIcon, 
    IoIosHelpCircle as HelpIcon,
} from "react-icons/io"

import { getServerSession } from "next-auth"

export default async function Navbar(){
    const session = await getServerSession() ?? true

    const user = { 
        fullName: "ervin cahyadinata sungkono",
        email: "ervin.sungkono@binus.ac.id"
    } // ini sementara sampai session jadi
    const projectLinks = [
        { label: 'Create a new project', url: '/projects/create' },
        { label: 'View all projects', url: '/projects' },
        // { label: t('Our Stakeholders'), url: '/about/#stakeholders' },
    ]

    console.log(session)
    return(
        <nav className="navbar w-full fixed z-fixed top-0 bg-white shadow-md">
            <div className="container h-20 flex justify-between items-center">
                <div className="flex h-full items-center gap-6 md:gap-8">
                    <Link href={"/"}>
                        <WeTrackLogo/>
                    </Link>
                    {   
                        session ?
                        <div className="flex h-full items-center">
                            <NavLink label={"Dashboard"} href={"/dashboard"}/>
                            <NavDropdown label={"Projects"} dropdownLinks={projectLinks}/>
                            <NavLink label={"History"} href={"/history"}/>
                        </div> 
                        : 
                        null
                    }
                </div>
                <div className="h-full flex items-center">
                    {   
                        session ?
                        <div className="h-full flex items-center gap-2">
                            {/* Ini nanti dropdown */}
                            <div className="flex items-center">
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
        </nav>
    )
}