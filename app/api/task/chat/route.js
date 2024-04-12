import { generateChatResponse } from "@/app/lib/OpenAIFunctions";
import { NextResponse } from "next/server";

export async function POST(request){
    const { taskDescription, content } = await request.json()

    const chatResponse = await generateChatResponse({
        taskDescription,
        content
    })
    // TODO: Get task by id
    // TODO-2: return response from generate chat function
    
    return NextResponse.json({
        data: chatResponse.message.content,
        success: true
    }, { status: 200 });
}