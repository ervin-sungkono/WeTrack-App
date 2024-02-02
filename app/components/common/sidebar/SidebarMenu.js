import SidebarLink from "./SidebarLink"

export default function SidebarMenu({ links, baseUrl }){
    return(
        <div className="flex flex-col whitespace-nowrap">
            <ul className="flex flex-col">
                {links.map(link => (
                    <SidebarLink {...link} baseUrl={baseUrl} key={link.label}/>
                ))}
            </ul>
        </div>
    )
}