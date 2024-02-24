export default function SkeletonInputField(){
    return(
        <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded-full w-32 md:w-48"></div>
            <div className="w-full h-8 md:h-11 bg-gray-200 rounded-md"></div>
        </div>
    )
}