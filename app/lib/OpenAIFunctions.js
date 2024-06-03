import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_SECRET_KEY
})

const defaultPayload = {
    model: "gpt-3.5-turbo-0125",
    max_tokens: 2048
}

export async function generateTaskByPrompt(projectDescription){
    const response = await openai.chat.completions.create({
        ...defaultPayload,
        response_format: {
            type: 'json_object'
        },
        messages: [
            {
                role: "system", 
                content: "You are a task generator, your job is to ANALYZE THE GIVEN PROJECT DESCRIPTION from the user and create list of tasks as detailed and related as possible in an array of JSON Objects with the given key 'data'. You may only return the response in a JSON format and nothing else. The format for each JSON Object inside the 'data' attribute must include keys such as 'taskName' which describes the task name, 'priority' which scales from 0-3 where 0 means no priority, 1 means low priority, 2 means medium priority, and 3 means high priority, and 'description' describing the task in a short paragraph. IF YOU DO NOT UNDERSTAND THE GIVEN PROJECT DESCRIPTION, then RETURN THE VALUE OF 'data' AS NULL. Return the 'taskName' and 'description' value in Indonesian Language"
            },
            {
                role: "user", 
                content: `Project Description: ${projectDescription}`
            }
        ]
    })

    return response.choices[0]
}

export async function generateChatResponse({ taskDescription, summary = [], content}){
    const response = await openai.chat.completions.create({
        ...defaultPayload,
        response_format: {
            type: 'json_object'
        },
        messages: [
            {
                role: "system",
                content: `You are given the last 8 chat history as a reference only for your next response, make sure to not include these chat histories directly on your response. IGNORE THESE HISTORIES IF IT DOES NOT ALIGN with the user's message`
            },
            ...summary,
            {
                role: "system", 
                content: `${taskDescription ?? `From the given task description: ${taskDescription}, your job is to analyze it and answer anything related from the user's question. If the task description is vague or unclear, u may skip analyzing the task description and just answer what the user asks.`} Return the response format as a JSON object containing two attributes 'response_chat' which is the original response message to be given to the user and allows markdown usage, and 'summarized_chat' which is the summary of the conversation between the user and the assistant, no longer than 50 words without any markdowns allowed. Try to answer the question in Indonesian language, unless the user asks for another language in response`
            },
            {
                role: "user", 
                content: content
            }
        ]
    })

    return response.choices[0]
}