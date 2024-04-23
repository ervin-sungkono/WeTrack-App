import Link from "next/link"
import { listDateFormat } from "@/app/lib/date"
import Label from "../common/Label"

export default function HistoryItem({type, task, project, oldStatus, newStatus, createdAt}){
    return (
        <div className="w-full bg-white flex justify-between items-center px-4 py-2 rounded shadow-sm">
            <div className="w-7/10 md:w-3/4 text:xs md:text-md">
                {type === 1 && (
                    <>
                        Anda membuat tugas <Link href={`#`} className="text:xs md:text-md font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="text-xs md:text-md font-bold text-basic-blue">{project}</Link>
                    </>   
                )}
                {type === 2 && (
                    <>
                        Anda membuat komentar pada tugas <Link href={`#`} className="text:xs md:text-md font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="text-xs md:text-md font-bold text-basic-blue">{project}</Link>
                    </>
                )}
                {type === 3 && (
                    <div className="flex flex-col gap-2">
                        <div>
                            Anda mengubah status pada tugas <Link href={`#`} className="text:xs md:text-md font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="text-xs md:text-md font-bold text-basic-blue">{project}</Link>
                        </div>
                        <div className="flex gap-2 text:xs md:text-sm text-dark-blue">
                            <Label color="#47389F" text={oldStatus}/> {"-->"} <Label color="#47389F" text={newStatus}/>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-3/10 md:w-1/4 text:xs md:text-sm text-right">
                {listDateFormat(createdAt)}
            </div>
        </div>
    )
}