import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLink({ label, href }){
    const pathname = usePathname()

    return(
        <Link
            href={href}
            className={`
                ${pathname === href ? "text-basic-blue" : "text-dark-blue hover:text-basic-blue"}
                relative w-full h-full px-2 md:px-4 py-4 lg:py-0 flex items-center font-medium text-sm transition-colors duration-300
                after:absolute after:bottom-0 after:left-0 after:w-full after:scale-x-0 after:hover:scale-x-100 after:origin-center after:h-1 after:bg-basic-blue after:transition-transform after:duration-300
            `}
        >
            {label}
        </Link>
    )
}