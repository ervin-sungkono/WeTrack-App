"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Mention, MentionsInput } from "react-mentions"
import UserIcon from "@/app/components/common/UserIcon"
import Button from "@/app/components/common/button/Button"

export default function CommentInput({ onSubmit }){
    const { data: session, status } = useSession()
    const [comment, setComment] = useState()
    const [focused, setFocus] = useState(false)

    const users=[
        {id: "ervin", display:"Ervin Cahyadinata Sungkono"},
        {id: "kenneth", display:"Kenneth Nathanael"},
        {id: "chris", display:"Christopher Vinantius"}
    ]

    const resetComment = () => {
        setComment("")
        setFocus(false)
    }

    if(status === 'loading') return null
    return(
        <div className="flex gap-2.5 pl-2 py-2">
            <div>
                <UserIcon fullName={session?.user.fullName} src={session?.user.profileImage} alt="" size="sm"/>
            </div>
            <div className="w-full flex flex-col items-end gap-1">
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
                        data={users}
                        displayTransform={(id, display) => "@" + (display)}
                        className="mentions__mention"
                    />
                </MentionsInput>
                {focused && (
                    <div className="flex gap-1">
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