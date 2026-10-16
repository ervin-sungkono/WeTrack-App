import SidebarLink from "./SidebarLink"
import type { SidebarNavigationLink } from "@/app/types/ui"

type SidebarMenuProps = { links: SidebarNavigationLink[]; baseUrl?: string; open: boolean }

export default function SidebarMenu({ links, baseUrl, open }: SidebarMenuProps){
    return(
        <div className="w-full flex flex-col whitespace-nowrap">
            <ul className="w-full flex flex-col">
                {links.map(link => (
                    <SidebarLink {...link} baseUrl={baseUrl} open={open} key={link.label}/>
                ))}
            </ul>
        </div>
    )
}
