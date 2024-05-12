export function getAllTaskStatus(projectId){
    const response = fetch(`/api/task/status?projectId=${projectId}`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function createNewTaskStatus({ projectId, statusName }){
    const response = fetch(`/api/task/status?projectId=${projectId}`, {
        method: 'POST',
        body: JSON.stringify({
            statusName
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function updateTaskStatus({ statusId, statusName }){
    const response = fetch(`/api/task/status/${statusId}`, {
        method: 'PUT',
        body: JSON.stringify({
            statusName
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function deleteTaskStatus({ statusId, projectId, newStatusId }){
    const response = fetch(`/api/task/status/${statusId}?projectId=${projectId}`, {
        method: 'DELETE',
        body: JSON.stringify({
            newStatusId
        })
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