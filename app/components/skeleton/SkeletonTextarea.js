export default function SkeletonTextarea({ rows = 4 }){
    return(
        <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded-full w-32 md:w-48"></div>
            <div className={`w-full bg-gray-200 rounded-md`} style={{height: `${rows * 24}px`}}></div>
        </div>
    )
}