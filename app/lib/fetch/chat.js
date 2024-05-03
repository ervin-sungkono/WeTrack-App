export function sendChat({taskId, content}){
    const response = fetch(`/api/task/${taskId}/chat`, {
        method: 'POST',
        body: JSON.stringify({
            content
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function getAllChat(taskId){
    const response = fetch(`/api/task/${taskId}/chat`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}