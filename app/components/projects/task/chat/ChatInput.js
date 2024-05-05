"use client"
import { useState, useRef } from "react"
import { onExpandableTextareaInput } from "@/app/lib/textarea-expandable"
import CustomTooltip from "@/app/components/common/CustomTooltip"

import { IoMdSend as SendIcon } from "react-icons/io"

export default function ChatInput({ name, onSubmit, placeholder, disabled = false }){
    const textAreaRef = useRef()
    const [text, setText] = useState("")

    return(
        <div className="absolute bottom-0 left-0 w-full flex gap-4 items-center">
            <form 
                onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit(text)
                    setText("")
                }}
                className="w-full flex gap-1"
            >
                <div className="relative w-full flex items-end py-3 md:py-4 pl-4 pr-12 bg-white rounded-md shadow-md border border-dark-blue/30 focus-within:border-basic-blue/60">
                    <textarea
                        id={name}
                        name={name}
                        ref={textAreaRef}
                        placeholder={placeholder}
                        value={text}
                        disabled={disabled}
                        rows={1}
                        data-min-rows="1"
                        className="auto_expand bg-transparent w-full p-0 border-none focus:ring-0 resize-none h-auto md:max-h-[200px] text-xs md:text-sm"
                        onChange={(e) => setText(e.target.value)}
                        onInput={(e) => {
                            onExpandableTextareaInput(e)
                        }}
                        onKeyDown={(e) => {
                            if(!disabled && e.key === 'Enter' && !e.shiftKey){
                                e.preventDefault()
                                document.getElementById('submit-btn').click()
                            }
                        }}
                        autoFocus
                    >
                    </textarea>
                    <div className="absolute right-2 md:right-3 bottom-1.5 md:bottom-3">
                        <CustomTooltip id={'submit-btn-tooltip'} content={"Kirim Pesan"}>
                            <button
                                id="submit-btn" 
                                type="submit"
                                className="p-2 disabled:bg-gray-400 text-white bg-basic-blue rounded transition-colors duration-200"
                                disabled={disabled || text.trim() === ""}
                            >
                                <SendIcon size={16}/>
                            </button>
                        </CustomTooltip>
                    </div>
                </div>
            </form>
        </div>
    )
}