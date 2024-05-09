import { NextResponse } from "next/server";
import { db } from "@/app/firebase/config";
import { getUserSession } from "@/app/lib/session";
import { nextAuthOptions } from "@/app/lib/auth";
import { collection, deleteDoc, FieldPath, getDoc } from "firebase/firestore";

export async function PUT(request, response, context){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized"
            }, { status: 401 })
        }

        const { statusId } = context.params

        if(!statusId){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        
    } catch (error) {
        console.error("Cannot get task statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, response, context){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized"
            }, { status: 401 })
        }

        const { id } = context.params
        const projectId = request.nextUrl.searchParams.get("projectId")

        if(!id){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const projectDocRef = await getDoc(doc(db, "projects", projectId))
        const { startStatus, endStatus, taskStatusList } = projectDocRef.data()
        let newTaskStatus;

        //kalo delete start task status
        if(startStatus.id == id){
            const taskStatusDocRef = await getDoc(doc(db, "taskStatuses", startStatus.id))
            const { tasks } = taskStatusDocRef.data()

            //kalo kosong task nya delete aja
            if(tasks.length == 0){
                
            } 
            
            //kalo ada isi task nya, update ke task status setelahnya  
            else if(tasks.length > 0){
                if(taskStatusList.length == 1){

                }
                else if(taskStatusList.length > 1){

                }
            }
        }

        //kalo delete end task status
        if(endStatus.id == id){
            const taskStatusDocRef = await getDoc(doc(db, "taskStatuses", endStatus.id))
            const { tasks } = taskStatusDocRef.data()

            //kalo kosong task nya delete aja
            if(tasks.length == 0){
                await deleteDoc(doc(db, "taskStatuses", id))

                const index = taskStatusList.findIndex((t) => t.id == id)
                if(!index){
                    return NextResponse.json({
                        message: "Task status not found in project collection"
                    })
                }
                taskStatusList.splice(index , 1)

                return NextResponse.json({
                    message: "Successfully delete task status"
                }, { status: 204 })
            } 
            
            //kalo ada isi task nya, update ke task status sebelumnya  
            else if(tasks.length > 0){
                if(taskStatusList.length == 1){

                }
                else if(taskStatusList.length > 1){
                    
                }
            }
        }
        
    } catch (error) {
        console.error("Cannot get task statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}