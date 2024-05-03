"use client"
import { useEffect, useState } from "react";
import Button from "../../common/button/Button";
import ChatModal from "./chat/ChatModal";
import ChatBox from "./chat/ChatBox";

import { RiMessage2Fill as ChatIcon } from "react-icons/ri";

export default function ChatSection({ taskId, title }){
    const [chatModal, setChatModal] = useState(false)
    const [chatData, setChatData] = useState([])

    useEffect(() => {
        if(taskId){
            
        }
    }, [taskId])

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            <p className="font-semibold text-xs md:text-sm flex-grow">Rekomendasi AI</p>
            <div className="flex items-start flex-col gap-2.5">
                {chatData.length > 0 ? 
                <ChatBox {...chatData[chatData.length-1]} fullWidth/> :
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