import Link from 'next/link'

export default function NavLink({ label, href }){
    return(
        <Link
            href={href}
            className='
                relative h-full px-2 md:px-4 flex items-center font-medium text-sm text-dark-blue hover:text-basic-blue transition-colors duration-300
                after:absolute after:bottom-0 after:left-0 after:w-full after:scale-x-0 after:hover:scale-x-100 after:origin-center after:h-1 after:bg-basic-blue after:transition-transform after:duration-300
            '
        >
            {label}
        </Link>
    )
}