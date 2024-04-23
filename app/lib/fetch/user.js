export async function signIn({ email, password}) {
    const res = await fetch(`http://localhost:3000/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }

}

export async function signUp(credentials) {
    const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }
}

export async function getUserProfile(){
    const res = await fetch(`/api/auth/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }

}

export async function updateUserProfile(formData) {
    const res = await fetch(`/api/auth/user`, {
        method: "PUT",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: formData
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }
}