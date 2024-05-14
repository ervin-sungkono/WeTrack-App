export default function OverviewCard({title, action, href, children}){

    return (
        <div className={`w-full bg-dark-gray p-4 rounded-lg`}>
            <div className={`flex justify-between items-center`}>
                <div className="font-bold text-base md:text-lg">{title}</div>
                <a href={href}>
                    <div className="text-basic-blue text-sm md:text-base cursor-pointer">{action}</div>
                </a>
            </div>
            <div className={`mt-4`}>
                {children}
            </div>
        </div>
    )
}