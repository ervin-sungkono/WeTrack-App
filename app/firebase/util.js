import { db } from "@/app/firebase/config"
import { query, orderBy, where, collection, doc, and, getDocs, getDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore"

export const getTaskReferenceOrderBy = ({ collectionName, field, id, orderByKey }) => {
    const q = query(collection(db, collectionName), and(where(field, '==', id), where('type', '==', 'Task')), orderBy(orderByKey))
    return q
}

export const getQueryReferenceOrderBy = ({ collectionName, field, id, orderByKey }) => {
    const q = query(collection(db, collectionName), where(field, '==', id), orderBy(orderByKey))
    return q
}

export const getQueryReference = ({ collectionName, field, id }) => {
    const q = query(collection(db, collectionName), where(field, '==', id))
    return q
}

export const getDocumentReference = ({ collectionName, id }) => {
    const document = doc(db, collectionName, id);
    return document
}

export const getProjectRole = async({ projectId, userId }) => {
    if(!userId) return null

    const q = query(collection(db, "teams"), and(where("projectId", '==', projectId), where("userId", '==', userId)))
    const querySnapshot = await getDocs(q)

    return querySnapshot?.docs[0]?.data().role
}

export const getContentAuthorization = async({ projectId, userId }) => {
    if(!projectId && !userId) return false

    const q = query(collection(db, "teams"), and(where("projectId", '==', projectId), where("userId", '==', userId)))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
}

export const deleteProject = async({ projectId }) => {
    try {   
        if(!projectId) return null
    
        const projectDocRef = doc(db, "projects", projectId)
    
        await deleteDoc(projectDocRef)

    } catch (error) {
        throw new Error("Something went wrong when deleting project")
    }
}

export const deleteTaskStatuses = async({ projectId }) => {
    try {   
        if(!projectId) return null
    
        const taskStatusCollectionRef = collection(db, "taskStatuses")
        const q = query(taskCollectionRef, where("projectId", "==", projectId))
        const taskStatusDocRef = await getDocs(q)

    } catch (error) {
        throw new Error("Something went wrong when deleting task status")
    }
}

export const deleteTasks = async({ projectId }) => {
    try {   
        if(!projectId) return null
    
        const taskCollectionRef = collection(db, "tasks")
        const q = query(taskCollectionRef, where("projectId", "==", projectId))
        const taskDocRef = await getDocs(q)

    } catch (error) {
        throw new Error("Something went wrong when deleting tasks")
    }
}

export const deleteLabels = async({ taskId }) => {
    try {   
        if(!taskId) return null
    
        const labelCollectionRef = collection(db, "labels")
        const q = query(labelCollectionRef, where("taskId", "==", taskId))
        const labelDocRef = await getDocs(q)

    } catch (error) {
        throw new Error("Something went wrong when deleting label")
    }
}

export const deleteAttachments = async({ taskId }) => {
    try {   
        if(!taskId) return null
    
        const attachmentCollectionRef = collection(db, "attachments")
        const q = query(attachmentCollectionRef, where("taskId", "==", taskId))
        const attachmentDocs = await getDocs(q)

    } catch (error) {
        throw new Error("Something went wrong when deleting label")
    }
}

export const handleDeletedUser = async({ userId }) => {
    try {
        if(!userId) return null
    
        const userDocRef = doc(db, "users", userId)
        const updateDoc = await updateDoc(userDocRef, {
            deletedAt: serverTimestamp()
        })
    
        const teamCollectionRef = collection(db, "teams")
        const q = query(teamCollectionRef, where("userId", "==", userId))
        const teamDocs = await getDocs(q)
    
        if(!teamDocs.empty()) {
            teamDocs.docs.forEach(async (item) => {
                await deleteDoc(doc(db, "teams", item.id))
            })

            //list project id if project owner
            const projectIds = teamDocs.docs.filter((item) => { 
                item.data().role == "Owner" 

                return item.data().projectId
            })
        }


        
    } catch (error) {
        throw new Error("Something went wrong when handling deleted user")
    }
} 

export const createHistory = async({ userId, taskId, projectId, eventType, action, previousValue, newValue }) => {
    try {
        if(!userId && !taskId && !projectId) return null

        const historyDocRef = collection(db, "histories")
        const newHistory =  await addDoc(historyDocRef, {
            userId: userId,
            taskId: taskId,
            projectId: projectId,
            eventType: eventType,
            action: action,
            previousValue: previousValue ?? null,
            newValue: newValue ?? null,
            createdAt: serverTimestamp()
        })

        return newHistory.id

    } catch (error) {
        throw new Error("Something went wrong when adding to history")
    }
}