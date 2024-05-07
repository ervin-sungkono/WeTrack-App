import { db } from "@/app/firebase/config"
import { query, where, collection, doc } from "firebase/firestore"

export const getQueryReference = ({ collectionName, field, id }) => {
    const q = query(collection(db, collectionName), where(field, '==', id))
    return q
}

export const getDocumentReference = ({ collectionName, id }) => {
    const document = doc(db, collectionName, id);
    return document
}

export const getProjectRole = async({ userId }) => {
    if(!userId) return null

    const q = query(collection(db, "teams"), where("userId", '==', userId))
    const querySnapshot = await getDocs(q)

    return querySnapshot?.docs[0]?.data().role
}