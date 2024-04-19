import { generateChatResponse } from "@/app/lib/OpenAIFunctions";
import { NextResponse } from "next/server";

export async function POST(request){
    const { taskDescription, content } = await request.json()

    const chatResponse = await generateChatResponse({
        taskDescription,
        content
    })
    
    return NextResponse.json({
        data: chatResponse.message.content,
        success: true
    }, { status: 200 });
}