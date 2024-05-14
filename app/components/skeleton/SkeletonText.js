export default function SkeletonText({width = 24, height = 4, rounded}){
    return(
        <div className={`bg-gray-200 ${rounded ? "rounded-full" : "rounded-md"}`} style={{width, height}}></div>
    )
}