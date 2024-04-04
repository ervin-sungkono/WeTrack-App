import { generateTaskByPrompt } from "@/app/lib/OpenAIFunctions";
import { NextResponse } from "next/server";

export async function POST(req){
    const { projectDescription } = await req.json()
    const response = await generateTaskByPrompt(projectDescription)
    
    const jsonData = JSON.parse(response.message.content)

    // If the data attribute is null, then the AI failed to generate the task
    if(!jsonData.data){
        return NextResponse.json({
            message: "Fail to generate task, unable to understand the given project description",
        }, { status: 500 });
    }
    
    return NextResponse.json({
        data: jsonData.data,
    }, { status: 200 });
}