import Link from "next/link"

export default function HistoryItem({type, task, project, oldStatus, newStatus, timestamp}){
    return (
        <div className="w-full bg-white flex justify-between items-center px-4 py-2 rounded-sm shadow-sm">
            <div className="text-md">
                {type === "taskCreation" && (
                    <>
                        Anda membuat tugas <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                    </>   
                )}
                {type === "commentCreation" && (
                    <>
                        Anda membuat komentar pada tugas <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                    </>
                )}
                {type === "taskStatusUpdate" && (
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
                {timestamp}
            </div>
        </div>
    )
}