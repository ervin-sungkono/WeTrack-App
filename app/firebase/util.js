import { db } from "@/app/firebase/config"
import { query, where, collection } from "firebase/firestore"

export const getQueryReference = ({ collectionName, field, id }) => {
    const q = query(collection(db, collectionName), where(field, '==', id))
    return q
}

export const getDocumentReference = ({ collectionName, id }) => {
    const doc = doc(db, collectionName, id);
    return doc
}