import { db } from "@/app/firebase/config";
import { NextResponse } from "next/server";
import { addDoc, collection, query, where, getDocs, doc, getDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { nextAuthOptions } from "@/app/lib/auth";
import { generateChatResponse } from "@/app/lib/OpenAIFunctions";
import { getUserSession } from "@/app/lib/session";
import { dateFormat } from "@/app/lib/date";

// export async function GET(request, response){
//     try{
//         const session = await getUserSession(request, response, nextAuthOptions)
//         const userId = session.user.uid

//         if(!userId){
//             return NextResponse.json({
//                 message: "Unauthorized, user id not found"
//             }, { status: 401 })
//         }

//         const { taskId } = response.params

//         if(!taskId) {
//             return NextResponse.json({
//                 message: "Missing paramater"
//             }, { status: 404 })
//         }

//         const chatsColRef = collection(db, 'chats')
//         const q = query(chatsColRef, where('taskId', '==', taskId))
//         const querySnapshot = await getDocs(q)

//         const chats = await Promise.all(querySnapshot.docs.map(async(document) => {
//             const senderId = document.data().senderId
//             if(senderId){
//                 const userRef = doc(db, "users", senderId)
//                 const userSnap = await getDoc(userRef)
//                 const { fullName, profileImage } = userSnap.data()

//                 return({
//                     id: document.id,
//                     sender: {
//                         fullName,
//                         profileImage
//                     },
//                     ...document.data()
//                 })
//             }
//             return({
//                 id: document.id,
//                 sender: null,
//                 ...document.data()
//             })
//         }))

//         return NextResponse.json({
//             data: chats, 
//             message: "Succesfully get all available chats"
//         }, { status: 200 })
//     }catch(error){
//         console.error("Cannot get chats", error);
//         return NextResponse.json({
//             data: null,
//             message: error.message
//         }, { status: 500 });
//     }
// }

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

        const projectData = await getDoc(doc(db, "projects", taskSnap.data().projectId))
        if(!projectData.exists()) {
            return NextResponse.json({
                success: false,
                message: "Project doesn't exists"
            }, { status: 404 })
        }

        if(projectData.data().deletedAt != null) {
            return NextResponse.json({
                success: false,
                message: "Project no longer exists"
            }, { status: 404 })
        }

        const { content } = await request.json()

        if(!content){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        // add chat from user
        const newUserChat = await addDoc(collection(db, 'chats'), {
                taskId: taskId,
                role: "user",
                content: content,
                senderId: userId,
                createdAt: new Date().toISOString(),
        });

        if(!newUserChat){
            return NextResponse.json({
                message: "Fail to create new chat"
            }, { status: 500 })
        }

        const chatSummaryCol = collection(db, "chatSummaries")
        const chatSummaryQuery = query(chatSummaryCol, where("taskId", '==', taskId), orderBy("createdAt", "desc"), limit(8))
        const chatSummarySnapshot = await getDocs(chatSummaryQuery)

        const summary = chatSummarySnapshot.docs.map((doc)=> (doc.data().content)).reverse().join(",")
        console.log(summary)
        
        const chatResponse = await generateChatResponse({
            taskDescription: taskSnap.data().description,
            summary,
            content
        })

        const parsedResponse = JSON.parse(chatResponse.message.content)

        await addDoc(collection(db, 'chats'), {
            taskId: taskId,
            role: "assistant",
            content: parsedResponse.response_chat,
            senderId: null,
            createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, "chatSummaries"), {
            taskId: taskId,
            content: parsedResponse.summarized_chat,
            createdAt: serverTimestamp()
        })

        return NextResponse.json({
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