'use client'
import dynamic from "next/dynamic"
import moment from "moment"
import Link from "next/link"
import WeTrackLogo from "../Logo"
import { useEffect, useState } from "react"
// import { useSession } from "next-auth/react"
import { getRecentProjects } from "@/app/lib/fetch/project"
import SkeletonText from "../../skeleton/SkeletonText"
import Button from "../button/Button"
import { getNewNotificationReference } from "@/app/firebase/util"
import { onSnapshot } from "firebase/firestore"

import { 
    IoMdNotifications as NotificationIcon, 
} from "react-icons/io"
import { getSession } from "next-auth/react"

const NavLink = dynamic(() => import("./NavLink"))
const NavDropdown = dynamic(() => import("./NavDropdown"))
const UserDropdown = dynamic(() => import("./UserDropdown"))
const LinkButton = dynamic(() => import("../button/LinkButton"))

export default function NavbarMenu({ showForm, hideMenu }){
    const [session, setSession] = useState()
    const [hamburgerState, setHamburgerState] = useState(false)
    const [recentProjects, setRecentProjects] = useState(null)
    const [newNotifications, setNewNotifications] = useState(false)
    const [loadingRecent, setLoadingRecent] = useState(false)

    const projectLinks = [
        { label: 'Buat proyek baru', url: '/projects/create' },
        { label: 'Lihat semua proyek', url: '/projects' },
    ]

    useEffect(() => {
        const fetchSession = async() => {
            const session = await getSession()
            // console.log(session)
            setSession(session)
        }
        fetchSession()
    }, [])

    useEffect(() => {
        if(!session) return
        
        const reference = getNewNotificationReference({ id: session.user.uid })
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const newNotifications = snapshot.docs
            if(newNotifications.length > 0) setNewNotifications(true)
            else setNewNotifications(false)
        })

        return () => unsubscribe()
    }, [session])

    useEffect(() => {
        if(session){
            setLoadingRecent(true)
            getRecentProjects()
            .then(projects => {
                if(projects.data) setRecentProjects(projects.data)
                else alert("Gagal memperoleh data proyek")
                setLoadingRecent(false)
            })
        }
    }, [session])

    // if(session === undefined){
    //     return (
    //         <div className="w-full flex items-center gap-12">
    //             <SkeletonText width={150} height={32} rounded/>
    //             <div className="hidden md:block ml-auto">
    //                 <SkeletonText width={160} height={40} rounded/>
    //             </div>
    //         </div>
    //     )
    // }

    return(
        <>
            <div className="flex w-full h-full items-center gap-6 md:gap-8">
                <Link href={"/"}>
                    <WeTrackLogo/>
                </Link>
                <div className={`nav-menu h-full flex-grow flex justify-between items-center pb-16 md:pb-0 
                    ${hamburgerState ? 'active' : ''}`}
                >
                    {   
                        (session && !hideMenu) ?
                        <div className={`w-full lg:w-auto flex flex-col lg:flex-row lg:h-full items-center`}>
                            <NavLink label={"Dasbor"} href={"/dashboard"}/>
                            <NavDropdown label={"Proyek"} baseLink={'/projects'} dropdownLinks={projectLinks}>
                                <div className="py-2 flex flex-col gap-1">
                                    <p className="px-4 text-sm font-bold uppercase">Terbaru</p>
                                    {loadingRecent && <p className="px-4 text-xs text-dark-blue/80">Memuat data proyek terbaru..</p>}
                                    {
                                        (!loadingRecent && recentProjects && recentProjects.length > 0) ? 
                                        recentProjects.map(project => (
                                            <Link href={`/projects/${project.id}`} key={project.id}>
                                                <div className="px-4 py-2 hover:bg-gray-100 flex flex-col gap-0.5">
                                                    <p className="text-xs md:text-sm font-semibold">{project.projectName}</p>
                                                    <p className="text-[10.8px] text-xs text-dark-blue/80">{moment.unix(project.createdAt.seconds).format("DD MMM YYYY")}</p>
                                                </div>
                                            </Link>
                                        )) :
                                        <p className="px-4 text-xs text-dark-blue/80">Anda belum memiliki proyek terbaru.</p>
                                    }
                                </div>
                            </NavDropdown>
                            <NavLink label={"Riwayat"} href={"/history"}/>
                            <Button variant="primary" size="md" className={"w-full mt-2 lg:mt-0 lg:ml-4"} onClick={showForm}>Buat Tugas</Button>
                        </div> 
                        : 
                        null
                    }
                    <div className="lg:h-full flex items-center lg:ml-auto">
                        {   
                            session ?
                            <div className="h-full flex items-center gap-2">
                                <div className="flex items-center py-4 lg:py-0">
                                    <Link href={"/notifications"} className="relative p-2 text-dark-blue hover:text-basic-blue transition-colors">
                                        <NotificationIcon size={24}/>
                                        {newNotifications && <div className="w-2 h-2 rounded-full bg-danger-red absolute top-0 right-0 -translate-x-1/2 translate-y-1/2"></div>}
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
                                Masuk
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