import Breadcrumb from "./Breadcrumb";

export default function Header({ title, links = null }){
    return(
        <div className="flex flex-col gap-1 md:gap-2 items-center md:items-start">
            {links && <Breadcrumb links={links}/>}
            <div className="text-xl md:text-2xl font-bold text-dark-blue text-center md:text-start">{title}</div>
        </div>
    )
}