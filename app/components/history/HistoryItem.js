import Link from "next/link"
import { listDateFormat } from "@/app/lib/date"

export default function HistoryItem({type, task, project, oldStatus, newStatus, timestamp}){
    return (
        <div className="w-full bg-white flex justify-between items-center px-4 py-2 rounded-sm shadow-sm">
            <div className="text-md">
                {type === 1 && (
                    <>
                        Anda membuat tugas <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                    </>   
                )}
                {type === 2 && (
                    <>
                        Anda membuat komentar pada tugas <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                    </>
                )}
                {type === 3 && (
                    <div>
                        <div>
                            Anda mengubah status pada tugas <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                        </div>
                        <div className="text-sm">
                            {oldStatus} {"-->"} {newStatus}
                        </div>
                    </div>
                )}
            </div>
            <div className="text-sm">
                {listDateFormat(timestamp)}
            </div>
        </div>
    )
}