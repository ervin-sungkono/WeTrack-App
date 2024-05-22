"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { getAllTeamMember } from "@/app/lib/fetch/team"
import { useSessionStorage } from "usehooks-ts"

import { Mention, MentionsInput } from "react-mentions"
import UserIcon from "@/app/components/common/UserIcon"
import Button from "@/app/components/common/button/Button"

export default function CommentInput({ onSubmit }){
    const { data: session, status } = useSession()
    const [comment, setComment] = useState()
    const [focused, setFocus] = useState(false)
    const [users, setUsers] = useState([])
    const [project, _] = useSessionStorage("project")

    useEffect(() => {
        if(project && project.id){
            getAllTeamMember({ projectId: project.id})
                .then(res => {
                    if(res.data) setUsers(res.data.filter(user => user.status === "accepted").map(d => ({
                        id: d.userId,
                        display: d.user.fullName
                    })))
                })
                .catch(e => console.log(e))
        }
    },[project])

    const resetComment = () => {
        setComment("")
        setFocus(false)
    }

    if(status === 'loading') return null
    return(
        <div className="flex gap-2.5 pl-2 py-2">
            <div>
                <UserIcon fullName={session?.user.fullName} src={session?.user.profileImage?.attachmentStoragePath} alt="" size="sm"/>
            </div>
            <div className="relative w-full flex flex-col items-end gap-1">
                <MentionsInput
                    className="mentions"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onFocus={() => setFocus(true)}
                    placeholder="Tambahkan komentar, gunakan '@' untuk menyebut pengguna lain"
                    a11ySuggestionsListLabel="Suggest User Mention"
                >
                    <Mention 
                        trigger={"@"}
                        data={users.filter(user => user.id != session?.user.uid)}
                        displayTransform={(id, display) => "@" + (display)}
                        className="mentions__mention"
                    />
                </MentionsInput>
                {focused && (
                    <div className="absolute right-0 -bottom-2 translate-y-full flex gap-1 z-50">
                        <Button onClick={resetComment} variant="danger" size="sm">Batal</Button>
                        <Button onClick={() => {
                            onSubmit(comment)
                            setComment("")
                            setFocus(false)
                        }} size="sm">Kirim</Button>
                    </div>
                )}
            </div>
        </div>
    )
}