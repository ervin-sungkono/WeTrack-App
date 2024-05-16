import { generateTaskByPrompt } from "@/app/lib/OpenAIFunctions";
import { NextResponse } from "next/server";

export const config = {
    runtime: 'edge', // Specify the runtime as 'edge'
};

export async function POST(req){
    const { projectDescription } = await req.json()
    if(!projectDescription){
        return NextResponse.json({
            message: "Missing mandatory fields",
            success: false
        }, { status: 400 });
    }
    
    const response = await generateTaskByPrompt(projectDescription)
    const jsonData = JSON.parse(response.message.content)

    // If the data attribute is null, then the AI failed to generate the task
    if(!jsonData.data){
        return NextResponse.json({
            message: "Gagal untuk menghasilkan task dari deskripsi proyek yang diberikan.",
            success: false
        }, { status: 500 });
    }
    
    return NextResponse.json({
        data: jsonData.data,
        success: true
    }, { status: 200 });
}