export default function OverviewCard({title, action, href, children}){

    return (
        <div className={`w-full bg-dark-gray px-4 py-2 rounded-lg overflow-auto`}>
            <div className={`flex justify-between items-center`}>
                <div className="font-bold text-base md:text-lg">{title}</div>
                <a href={href}>
                    <div className="text-basic-blue font-medium text-xs md:text-sm cursor-pointer hover:underline">{action}</div>
                </a>
            </div>
            <div className={`mt-2`}>
                {children}
            </div>
        </div>
    )
}