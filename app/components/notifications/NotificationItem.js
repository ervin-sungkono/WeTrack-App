import Link from "next/link"
import UserIcon from "../common/UserIcon"
import { listDateFormat } from "@/app/lib/date"

export default function NotificationsItem({type, task, user, project, oldRole, newRole, timestamp}){
    return (
        <div className="w-full bg-white flex justify-between items-center px-4 py-2 rounded-sm shadow-sm">
            <div className="text-md">
                {type === 1 && (
                    <>
                        Anda diberikan tugas <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                    </>   
                )}
                {type === 2 && (
                    <div className="flex items-center gap-2">
                        <div>
                            <UserIcon fullName={user} />
                        </div>
                        <div>
                            <div>
                                <Link href={`#`} className="font-bold text-basic-blue">{user}</Link> membuat komentar pada tugas Anda <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                            </div>
                            <div>
                                <Link href={`#`} className="text-basic-blue">Lihat Komentar</Link>
                            </div>
                        </div>
                    </div>
                )}
                {type === 3 && (
                    <div className="flex items-center gap-2">
                        <div>
                            <UserIcon fullName={user} />
                        </div>
                        <div>
                            <div>
                                <Link href={`#`} className="font-bold text-basic-blue">{user}</Link> menyebut Anda dalam komentarnya pada tugas <span className="font-bold text-basic-blue">{task}</span> dalam proyek <span className="font-bold text-basic-blue">{project}</span>
                            </div>
                            <div>
                                <Link href={`#`} className="text-basic-blue">Lihat Balasan</Link>
                            </div>
                        </div>
                    </div>
                )}
                {type === 4 && (
                    <>
                        Peran Anda dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link> telah diubah dari <span className="font-bold">{oldRole}</span> menjadi <span className="font-bold">{newRole}</span>
                    </>
                )}
            </div>
            <div className="text-sm">
                {listDateFormat(timestamp)}
            </div>
        </div>
    )
}