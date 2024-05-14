import Link from "next/link"
import { usePathname } from "next/navigation"
import { removeTrailingSlash } from "@/app/lib/string"

export default function SidebarLink({ label, url, icon, baseUrl, open }){
    const pathname = usePathname()
    const pathString = removeTrailingSlash(`${baseUrl}${url}`)
    
    return(
        <Link href={pathString} className="group select-none">
            <div className={`flex items-center gap-2 px-4 py-2.5 ${pathname === pathString ? "bg-white text-basic-blue cursor-default" : "group-hover:bg-dark-blue/10 text-dark-blue group-hover:text-basic-blue"} rounded-md transition-colors duration-300`}>
                <div>{icon}</div>
                <p className="text-sm font-medium transition-[width] duration-300 overflow-hidden" style={{width: (open ? "100%" : "0px")}}>{label}</p>
            </div>
        </Link>
    )
}