import { db } from "@/app/firebase/config"
import { query, orderBy, where, collection, doc, and, getDocs, getDoc, updateDoc, serverTimestamp, addDoc, limit, deleteDoc, writeBatch } from "firebase/firestore"
import { getSession } from "next-auth/react"
import { deleteExistingFile } from "../lib/file"
import { getHistoryAction, getHistoryEventType } from "../lib/history"

export const getTaskReferenceOrderBy = ({ field, id, orderByKey }) => {
    const q = query(collection(db, 'tasks'), and(where(field, '==', id), where('type', '==', 'Task')), orderBy(orderByKey))
    return q
}

export const getNewNotificationReference = ({ id }) => {
    const q = query(collection(db, 'notifications'), and(where('userId', '==', id), where('status', '==', 'new')), limit(1))
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

export const getContentAuthorization = async({ projectId }) => {
    if(!projectId) return false

    const session = await getSession()
    const userId = session.user.uid
    if(!userId) return false

    const q = query(collection(db, "teams"), and(where("projectId", '==', projectId), where("userId", '==', userId)))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
}

export const deleteProject = async({ projectId }) => {
    try {   
        if(!projectId) return null
    
        const batch = writeBatch(db)

        const projectDocRef = doc(db, "projects", projectId)

        const teamQuery = query(collection(db, "teams"), where('projectId', '==', projectId))
        const teamSnapshot = await getDocs(teamQuery)

        teamSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                deletedAt: serverTimestamp()
            })
        })
        
        batch.update(projectDocRef, {
            deletedAt: serverTimestamp()
        })

        await batch.commit()
    } catch (error) {
        throw new Error("Something went wrong when deleting project")
    }
}

export const deleteTaskStatuses = async({ projectId }) => {
    try {   
        if(!projectId) return null
    
        const taskStatusCollectionRef = collection(db, "taskStatuses")
        const q = query(taskStatusCollectionRef, where("projectId", "==", projectId))
        const taskStatusDocSnapShot = await getDocs(q)

        if(!taskStatusDocSnapShot.empty) {
            await Promise.all(taskStatusDocSnapShot.docs.map(async (item) => {
                const taskStatusDocRef = doc(db, "taskStatuses", item.id);

                await deleteDoc(taskStatusDocRef)
            }))
        }

    } catch (error) {
        throw new Error("Something went wrong when deleting task status")
    }
}

export const deleteTasks = async({ projectId }) => {
    try {   
        if(!projectId) return null
    
        const taskCollectionRef = collection(db, "tasks")
        const q = query(taskCollectionRef, where("projectId", "==", projectId))
        const taskDocSnapShot = await getDocs(q)

        if(!taskDocRef.empty) {
            await Promise.all(taskDocSnapShot.docs.map(async (item) => {
                const taskDocRef = doc(db, "tasks", item.id)

                await deleteDoc(taskDocRef)
            }))
        }

    } catch (error) {
        throw new Error("Something went wrong when deleting tasks")
    }
}

export const deleteTask = async({ taskId, userId }) => {
    try {   
        if(!taskId) return null
    
        const taskDocRef = doc(db, "tasks", taskId)
        const taskDoc = await getDoc(taskDocRef)

        if(!taskDoc.exists()) {
            throw new Error("Task not found")
        }

        const subTaskDocRef = collection(db, "tasks")
        const q = query(subTaskDocRef, where("parentId", "==", taskId))
        const subTaskSnapShot = await getDocs(q)

        if(!subTaskSnapShot.empty) {
            await Promise.all(subTaskSnapShot.docs.map(async(item) => {
                const subTaskDocRef = doc(db, "tasks", item.id)
                const subTaskDoc = await getDoc(subTaskDocRef)
                
                await updateDoc(subTaskDocRef, {
                    parentId: null,
                    updatedAt: serverTimestamp()
                });

                await createHistory({ 
                    userId: userId,
                    taskId: taskId,
                    projectId: subTaskDoc.data().projectId,
                    eventType: getHistoryEventType.subtask,
                    action: getHistoryAction.update
                })
            }))
        }
        
        await deleteDoc(taskDocRef)

    } catch (error) {
        throw new Error("Something went wrong when deleting tasks")
    }
}

export const deleteLabels = async({ taskId }) => {
    try {   
        if(!taskId) return null
    
        const labelCollectionRef = collection(db, "labels")
        const q = query(labelCollectionRef, where("taskId", "==", taskId))
        const labelDocSnapShot = await getDocs(q)

        if(!labelDocSnapShot.empty) {
            await Promise.all(labelDocSnapShot.docs.map(async (item) => {
                const labelDocRef = doc(db, "tasks", item.id)

                await deleteDoc(labelDocRef)
            }))
        }

    } catch (error) {
        throw new Error("Something went wrong when deleting label")
    }
}

export const deleteAttachments = async({ taskId }) => {
    try {   
        if(!taskId) return null
    
        const attachmentCollectionRef = collection(db, "attachments")
        const q = query(attachmentCollectionRef, where("taskId", "==", taskId))
        const attachmentDocSnapShot = await getDocs(q)

        if(!attachmentDocSnapShot.empty) {
            await Promise.all(attachmentDocSnapShot.docs.map(async (item) => {
                const attachmentDocRef = doc(db, "attachments", item.id)
                const attachmentDoc = await getDoc(attachmentDocRef)

                if(!attachmentDoc.exists()) {
                    throw new Error('Document does not exists')
                }

                await deleteExistingFile(attachmentDoc.data().attachmentStoragePath)
            }))
        }

    } catch (error) {
        throw new Error("Something went wrong when deleting label")
    }
}

export const handleDeletedUser = async({ userId }) => {
    try {
        if(!userId) return null
    
        const userDocRef = doc(db, "users", userId)
    
        const teamCollectionRef = collection(db, "teams")
        const q = query(teamCollectionRef, where("userId", "==", userId))
        const teamDocs = await getDocs(q)
    
        if(!teamDocs.empty) {
            //list project id if project owner
            const projects = teamDocs.docs.filter((item) => (item.data().role == "Owner"))
            const teamMembers = teamDocs.docs.filter((item) => (item.data().role != "Owner"))

            for(const project of projects) {
                await deleteProject({ projectId: project.data().projectId })
            }
            
            for (const teamDoc of teamMembers) {
                const batch = writeBatch(db)

                const tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', teamDoc.data().userId))
                const tasksWithAssignedUser = await getDocs(tasksQuery)

                tasksWithAssignedUser.docs.forEach(async(taskDoc) => {
                    batch.update(taskDoc.ref, {
                        assignedTo: null
                    })
                    const oldAssignedToValue = taskDoc.data().assignedTo == null ? null : await getDoc(doc(db, "users", taskDoc.data().assignedTo))
                    await createHistory({
                        userId: null,
                        taskId: taskDoc.id,
                        projectId: taskDoc.data().projectId,
                        action: getHistoryAction.update,
                        eventType: getHistoryEventType.assignedTo,
                        previousValue: taskDoc.data().assignedTo == null ? null : {...oldAssignedToValue.data()},
                        newValue: null
                    })
                })

                batch.delete(teamDoc.ref)
                await batch.commit()
            }

            return null
        }

        
        await updateDoc(userDocRef, {
            email: null,
            deletedAt: serverTimestamp()
        })

        return

    } catch (error) {
        throw new Error("Something went wrong when handling deleted user")
    }
} 

export const createHistory = async({ userId, taskId, projectId, eventType, deletedValue, action, previousValue, newValue }) => {
    try {
        const user = userId && await getDoc(doc(db, "users", userId));
        const task = taskId && await getDoc(doc(db, "tasks", taskId));
        const project = projectId && await getDoc(doc(db, "projects", projectId))

        const historyDocRef = collection(db, "histories")
        const newHistory =  await addDoc(historyDocRef, {
            user: userId && {
                id: user.id,
                fullName: user.data().fullName,
                profileImage: user.data().profileImage
            },
            userId: userId ?? null,
            task: taskId && {
                id: task.id,
                taskName: task.data().taskName
            },
            taskId: taskId ?? null,
            project: projectId && {
                id: project.id,
                projectName: project.data().projectName
            },
            projectId: projectId ?? null,
            eventType: eventType,
            deletedValue: deletedValue ?? null,
            action: action, // create, update, delete
            previousValue: previousValue ?? null,
            newValue: newValue ?? null,
            createdAt: serverTimestamp()
        })

        return newHistory.id

    } catch (error) {
        throw new Error("Something went wrong when adding to history: ", + error)
    }
}

export const createNotification = async({ userId, senderId, taskId, projectId, type, newValue }) => {
    try {
        if(!userId && !projectId) return null

        const sender = senderId && await getDoc(doc(db, "users", sender));
        const task = taskId && await getDoc(doc(db, "tasks", taskId));
        const project = projectId && await getDoc(doc(db, "projects", projectId))

        const notificationDocRef = collection(db, "notifications")
        const newNotification = await addDoc(notificationDocRef, {
            userId: userId,
            senderId: senderId,
            sender: senderId && {
                id: sender.id,
                fullName: sender.data().fullName,
                profileImage: sender.data().profileImage
            },
            taskId: taskId ?? null,
            task: taskId && {
                id: task.id,
                taskName: task.data().taskName
            },
            project: projectId && {
                id: project.id,
                projectName: project.data().projectName
            },
            projectId: projectId,
            type: type, // RoleChange, Mention, AddedComment, AssignedTask
            newValue: newValue ?? null,
            status: "new",
            createdAt: serverTimestamp()
        })

        return newNotification.id
    } catch (error) {
        throw new Error("Something went wrong when adding to notification")
    }
}