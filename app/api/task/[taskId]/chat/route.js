import { db } from "@/app/firebase/config";
import { NextResponse } from "next/server";
import { addDoc, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { nextAuthOptions } from "@/app/lib/auth";
import { generateChatResponse } from "@/app/lib/OpenAIFunctions";
import { getUserSession } from "@/app/lib/session";

export async function GET(request, response){
    try{
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { taskId } = response.params

        if(!taskId) {
            return NextResponse.json({
                message: "Missing paramater"
            }, { status: 404 })
        }

        const chatsColRef = collection(db, 'chats')
        const q = query(chatsColRef, where('taskId', '==', taskId))
        const querySnapshot = await getDocs(q)

        const chats = querySnapshot.map(doc => ({
                id: doc.id,
                ...doc.data()
        }))

        return NextResponse.json({
            data: chats, 
            message: "Succesfully get all available chats"
        }, { status: 200 })
    }catch(error){
        console.error("Cannot get chats", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized"
            }, { status: 401 })
        }

        const { taskId } = response.params

        const taskDocRef = doc(db, "tasks", taskId)
        const taskSnap = await getDoc(taskDocRef)

        if(!taskSnap.exists()){
            return NextResponse.json({
                message: "Task id is invalid or not found"
            }, { status: 404 })
        }

        const { taskDescription, content } = await request.json()

        if(!content){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const chatResponse = await generateChatResponse({
            taskDescription,
            content
        })

        const newChatData = [
            {
                role: "user",
                content: content,
                senderId: userId
            },{
                role: "assistant",
                content: chatResponse.message.content,
                senderId: null
            }
        ]

        const newChat = newChatData.map(async(newChat) => {
            return await addDoc(collection(db, 'chats'), {
                taskId: taskId,
                ...newChat,
                createdAt: new Date().toISOString(),
            });
        })

        console.log(newChat)

        if(!newChat){
            return NextResponse.json({
                message: "Fail to create new chat"
            }, { status: 500 })
        }

        return NextResponse.json({
            data: newChat.map(chat => ({
                id: chat.id,
                ...chat
            })),
            message: "Successfully create new chat"
        }, {  status: 200 })

    } catch (error) {
        console.error("Cannot get chat", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}