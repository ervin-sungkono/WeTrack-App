import Link from "next/link"
import { listDateFormat } from "@/app/lib/date"
import Label from "../common/Label"

export default function HistoryItem({type, task, project, oldStatus, newStatus, createdAt}){
    return (
        <div className="w-full bg-white flex flex-col md:flex-row items-end md:items-center px-4 py-2 rounded shadow-sm gap-3">
            <div className="w-full text-xs md:text-sm">
                {type === 1 && (
                    <>
                        Anda membuat tugas <Link href={`#`} className="text-xs md:text-sm font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="text-xs md:text-sm font-bold text-basic-blue">{project}</Link>
                    </>   
                )}
                {type === 2 && (
                    <>
                        Anda membuat komentar pada tugas <Link href={`#`} className="text-xs md:text-sm font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="text-xs md:text-sm font-bold text-basic-blue">{project}</Link>
                    </>
                )}
                {type === 3 && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah status pada tugas <Link href={`#`} className="text-xs md:text-sm font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="text-xs md:text-sm font-bold text-basic-blue">{project}</Link>
                        </div>
                        <div className="flex items-center gap-1 text-xs md:text-sm text-dark-blue">
                            <Label color="#47389F" text={oldStatus}/> {"-->"} <Label color="#47389F" text={newStatus}/>
                        </div>
                    </div>
                )}
            </div>
            <div className="text-xs md:text-sm text-right whitespace-nowrap">
                {listDateFormat(createdAt)}
            </div>
        </div>
    )
}