export async function signIn(credentials) {
    const res = await fetch(`/api/auth/login`, {
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