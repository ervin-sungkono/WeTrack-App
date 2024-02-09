import app from "@/app/firebase/config";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"

const auth = getAuth(app);

const signUp = async (email, password) => {
    console.log("auth", auth)
    let result = null, 
        error = null
    try {
        result = await createUserWithEmailAndPassword(auth, email, password)
        console.log("result", result)
        
    } catch (e) {
        error = e
        console.error("Database error", error)
    }

    return { result, error }
}

export default signUp;