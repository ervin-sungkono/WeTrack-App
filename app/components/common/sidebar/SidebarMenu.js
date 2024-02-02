import SidebarLink from "./SidebarLink"

export default function SidebarMenu({ links, baseUrl, open }){
    return(
        <div className="flex flex-col whitespace-nowrap">
            <ul className="flex flex-col">
                {links.map(link => (
                    <SidebarLink {...link} baseUrl={baseUrl} open={open} key={link.label}/>
                ))}
            </ul>
        </div>
    )
}