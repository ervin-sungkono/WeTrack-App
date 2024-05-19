const signInDomain = process.env.NEXT_PUBLIC_LOGIN_DOMAIN

export async function signIn({email, password}) {
    const res = await fetch(`${signInDomain}/api/auth/login`, {
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

export async function resetUserPassword(email) {
    const res = await fetch(`/api/auth/user/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(email)
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }
}

export async function changeUserPassword({oldPassword, newPassword}) {
    const res = await fetch(`/api/auth/user/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword
        })
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

export async function getUserProfileById(profileId) {
    const res = await fetch(`/api/user/${profileId}`, {
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
        body: formData
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }
}

export async function deleteUserImageProfile(){
    const res = await fetch(`/api/auth/user/profile-picture`, {
        method: "DELETE"
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }
}

export async function deleteUserProfile(password) {
    const res = await fetch(`/api/auth/user`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(password)
    })
    if(res.ok){
        return res.json()
    }else{
        throw new Error(await res.text())
    }
}

export async function getUserHistory(){
    const res = await fetch(`/api/history`, {
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

export async function getUserTaskHistory({taskId}) {
    const res = await fetch(`/api/history?taskId=${taskId}`, {
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

export async function getUserNotification(){
    const res = await fetch(`/api/notification`, {
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