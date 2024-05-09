export function getAllTaskStatus(projectId){
    const response = fetch(`/api/task/status?projectId=${projectId}`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function reorderTaskStatus({ projectId, statusId, oldIndex, newIndex }){
    if(newIndex === oldIndex) return
    const response = fetch(`/api/task/status/${statusId}/transition?projectId=${projectId}`,{
        method: 'POST',
        body: JSON.stringify({
            oldIndex,
            newIndex
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}