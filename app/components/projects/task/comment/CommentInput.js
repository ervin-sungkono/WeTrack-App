"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Mention, MentionsInput } from "react-mentions"
import UserIcon from "@/app/components/common/UserIcon"

export default function CommentInput(){
    const { data: session, status } = useSession()
    const [comment, setComment] = useState()

    const users=[
        {id: "ervin", display:"Ervin Cahyadinata Sungkono"},
        {id: "kenneth", display:"Kenneth Nathanael"},
        {id: "chris", display:"Christopher Vinantius"}
    ]

    if(status === 'loading') return null
    return(
        <div className="flex gap-2.5 pl-2 py-2">
            <div>
                <UserIcon fullName={session?.user.fullName} src={session?.user.profileImage} alt="" size="sm"/>
            </div>
            <MentionsInput
                className="mentions"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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
        </div>
    )
}