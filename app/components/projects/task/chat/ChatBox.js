"use client"
import { memo } from "react"
import UserIcon from "@/app/components/common/UserIcon"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter"
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { listDateFormat } from "@/app/lib/date"

function ChatBox({ role, content, sender, createdAt, pending = false, fullWidth }){
    const isUser = role === "user"
    return(
        <div className={`flex gap-4 ${!fullWidth && (isUser ? "flex-row-reverse pl-8 sm:pl-24" : "flex-row pr-8 sm:pr-24")}`}>
            <div>
                <UserIcon 
                    fullName={sender && sender.fullName}
                    src={isUser ? sender.profileImage?.attachmentStoragePath : "/images/ai-profile.png"}
                    size="sm"
                />
            </div>
            <div className={`relative py-2 px-3 rounded-b-md ${isUser ? "bg-purple-100 rounded-tl-md text-right" : "bg-gray-100 rounded-tr-md text-left"} before:absolute before:w-0 before:h-0  before:top-0 before:right-auto before:bottom-auto before:border-[12px] before:border-solid  before:border-transparent ${isUser ? "before:-right-3 before:border-t-purple-100" : "before:-left-3 before:border-t-gray-100"}`}>
                <p className="text-sm font-semibold text-dark-blue mb-1">
                    {isUser ? sender.fullName : "Assisten WeTrack"}
                </p>
                <Markdown 
                    remarkPlugins={[remarkGfm]} 
                    components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? 
                            (<SyntaxHighlighter
                                {...props}
                                style={vs2015}
                                language={match[1]}
                                PreTag="div"
                                wrapLongLines
                                customStyle={{borderRadius: '6px'}}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>)
                            : 
                            (<code {...props} className={className}>
                                {children}
                            </code>)
                        }
                    }}
                    disallowedElements={["h1", "h2", "h3", "h4", "h5", "h6"]}
                    className="markdown mb-2"
                >
                    {content}
                </Markdown>
                <div className="w-full flex justify-end">
                    <p className="text-xs text-dark-blue/60">{listDateFormat(createdAt)}</p>
                </div>
            </div>
        </div>
    )
}

export default memo(ChatBox)