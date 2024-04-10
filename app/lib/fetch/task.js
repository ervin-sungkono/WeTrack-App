export function getAllTask(projectId){
    const response = fetch(`/api/task?projectId=${projectId}`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function createNewTask({ 
    taskName, 
    startDate,
    dueDate,
    priority, 
    description = "", 
    projectId, 
    statusId,
    assignedTo,
    labels,
    parentId
}){
    const payload = {
        taskName,
        startDate,
        dueDate,
        priority,
        description,
        projectId,
        statusId,
        assignedTo,
        labels: labels ? JSON.parse(labels).map(label => label.value) : null,
        parentId
    }

    const response = fetch('/api/task', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}