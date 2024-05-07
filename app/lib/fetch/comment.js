// export function getAllComments(taskId){
//     const response = fetch(`/api/task/${taskId}/comment`,{
//         method: 'GET',
//     })
//     .then(res => res.json())
//     .catch(err => console.log(err))

//     return response
// }

export function addComment({text, taskId}){
    const response = fetch(`/api/task/${taskId}/comment`, {
        method: 'POST',
        body: JSON.stringify({
            commentText: text
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function deleteComment({taskId, commentId}){
    const response = fetch(`/api/task/${taskId}/comment/${commentId}`, {
        method: 'DELETE',
    })
    .catch(err => console.log(err))

    return response
}