export function getAllTask(projectId){
    const response = fetch(`/api/task?projectId=${projectId}`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function createNewTask({ taskName, priority, description = null, projectId, statusId }){
    const payload = {
        taskName,
        priority,
        description,
        projectId,
        statusId
    }

    const response = fetch('/api/task', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}