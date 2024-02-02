import Link from "next/link"
import { usePathname } from "next/navigation"
import { removeTrailingSlash } from "@/app/lib/string"

export default function SidebarLink({ label, url, baseUrl, variant = 'default' }){
    const pathname = usePathname()
    const pathString = removeTrailingSlash(`${baseUrl}${url}`)
    
    return(
        <Link href={pathString} className="group">
            <div className={`px-4 py-2.5 ${pathname === pathString ? "bg-white text-basic-blue" : "group-hover:bg-dark-blue/10 text-dark-blue"} rounded-md transition-colors duration-300`}>
                <p className="text-xs md:text-sm font-medium">{label}</p>
            </div>
        </Link>
    )
}