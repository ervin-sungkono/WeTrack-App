"use client"
import Button from "../../common/button/Button";

import { RiMessage2Fill as ChatIcon } from "react-icons/ri";
import ChatModal from "./chat/ChatModal";
import { useState } from "react";

export default function ChatSection({ taskId, title }){
    const [chatModal, setChatModal] = useState(false)
    const chats = [
        {
            id: "chat-001",
            taskId: "TSK01",
            role: "user",
            content: "How to create a landing page using nextjs and tailwind CSS?",
            sender: {
                fullName: "Ervin Cahyadinata Sungkono",
                profileImage: null
            },
            createdAt: new Date("2024-04-15 08:00:00")
        },
        {
            id: "chat-002",
            taskId: "TSK01",
            role: "assistant",
            content: "To create a landing page using Next.js and Tailwind CSS, you'll start by setting up a new Next.js project. Then, design your landing page using Tailwind's utility classes for styling, ensuring responsiveness across devices. Utilize Next.js for routing and creating dynamic components if needed. Organize your components logically, such as header, main content section, and footer. Ensure your page is optimized for SEO by setting appropriate meta tags and descriptions. Finally, deploy your landing page using platforms like Vercel for seamless hosting. With Next.js's server-side rendering and Tailwind's utility-first approach, you can swiftly develop a sleek and performant landing page. ",
            sender: null,
            createdAt: new Date("2024-04-15 08:01:00")
        }
    ]

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            <p className="font-semibold text-xs md:text-sm flex-grow">Rekomendasi AI</p>
            <div className="flex items-start flex-col gap-2.5">
                {chats.length > 0 ? 
                <div></div> :
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
                chats={chats}
                onClose={() => setChatModal(false)}
            />}
        </div>
    )
}