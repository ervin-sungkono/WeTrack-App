import { db } from "@/app/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const taskTypesColRef = collection(db, 'taskTypes')
        const taskTypesDocsRef = await getDocs(taskTypesColRef)

        if(!taskTypesDocsRef) {
            return NextResponse.json({
                message: "Can't get task type docs"
            }, { status: 404 })
        }

        let taskTypes = [];

        taskTypesDocsRef.forEach((doc) => {
            taskTypes.push({
                id: doc.id,
                taskType: doc.data().taskType
            })
            return taskTypes
        })

        return NextResponse.json({
            data: taskTypes, 
            message: "Succesfully get all available task types"
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot get task types", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}