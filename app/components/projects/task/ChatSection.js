"use client"
import { useEffect, useState, useRef } from "react";
import Button from "../../common/button/Button";
import ChatModal from "./chat/ChatModal";
import ChatBox from "./chat/ChatBox";

import { RiMessage2Fill as ChatIcon } from "react-icons/ri";
import { getDocumentReference, getQueryReference } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import { sortDateFn } from "@/app/lib/helper";

export default function ChatSection({ taskId, title }){
    const [chatModal, setChatModal] = useState(false)
    const [chatData, setChatData] = useState([])

    useEffect(() => {
        if(!taskId) return
        const reference = getQueryReference({ collectionName: "chats", field: "taskId", id: taskId })
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const updatedChats = await Promise.all(snapshot.docs.map(async(document) => {
                const senderId = document.data().senderId
                if(senderId){
                    const userRef = getDocumentReference({ collectionName: "users", id: senderId })
                    const userSnap = await getDoc(userRef)
                    const { fullName, profileImage } = userSnap.data()

                    return({
                        id: document.id,
                        sender: {
                            fullName,
                            profileImage
                        },
                        ...document.data()
                    })
                }
                return({
                    id: document.id,
                    sender: null,
                    ...document.data()
                })
            }))
            setChatData(sortDateFn({ data: updatedChats, sortDirection: 'asc' }))
        })
        return () => unsubscribe()
    }, [taskId])

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            <p className="font-semibold text-xs md:text-sm flex-grow">Rekomendasi AI</p>
            <div className="flex items-start flex-col gap-2.5">
                {chatData.length > 0 ? 
                <div className="relative max-h-[300px] overflow-hidden pb-4">
                    <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-white to-transparent z-20"></div>
                    <ChatBox {...chatData[chatData.length-1]} fullWidth/>
                </div>
                 :
                <div className="text-xs md:text-sm text-dark-blue/80">Belum ada riwayat percakapan dengan AI</div>}
                <Button size="sm" onClick={() => setChatModal(true)}>
                    <div className="flex gap-2 items-center">
                        <ChatIcon size={16}/>
                        <p>Bicara dengan AI</p>
                    </div>
                </Button>
            </div>
            {chatModal && 
            <ChatModal 
                title={title} 
                taskId={taskId} 
                chats={chatData}
                onClose={() => setChatModal(false)}
            />}
        </div>
    )
}