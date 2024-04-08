import Link from "next/link"
import UserIcon from "../common/UserIcon"

export default function NotificationsItem({type, task, user, project, oldRole, newRole, timestamp}){
    return (
        <div className="w-full bg-white flex justify-between items-center px-4 py-2 rounded-sm shadow-sm">
            <div className="text-md">
                {type === "taskAssignment" && (
                    <>
                        Anda diberikan tugas <Link href={`#`} className="font-bold text-basic-blue">{task}</Link> dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link>
                    </>   
                )}
                {type === "newComment" && (
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
                {type === "commentMention" && (
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
                {type === "projectRoleChange" && (
                    <>
                        Peran Anda dalam proyek <Link href={`#`} className="font-bold text-basic-blue">{project}</Link> telah diubah dari <span className="font-bold">{oldRole}</span> menjadi <span className="font-bold">{newRole}</span>
                    </>
                )}
            </div>
            <div className="text-sm">
                {timestamp}
            </div>
        </div>
    )
}