export function getTaskById(taskId){
    const response = fetch(`/api/task/${taskId}`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

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
    type = "Task",
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
        projectId,
        type,
        startDate,
        dueDate,
        priority,
        taskName,
        description,
        statusId,
        assignedTo,
        labels: labels && (labels.length > 0 ? JSON.parse(labels).map(label => label.id) : null),
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

export function reorderTask({ taskId, statusId, newStatusId, oldIndex, newIndex }){
    if(statusId === newStatusId && newIndex === oldIndex) return
    const response = fetch(`/api/task/${taskId}/transition`,{
        method: 'POST',
        body: JSON.stringify({
            newStatusId,
            oldIndex,
            newIndex
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function updateTask({ 
    taskId,
    taskName, 
    startDate,
    dueDate,
    priority, 
    description, 
    assignedTo,
    labels,
    parentId
}){
    const payload = {
        startDate,
        dueDate,
        priority,
        taskName,
        description,
        assignedTo,
        labels: labels && (labels.length > 0 ? JSON.parse(labels).map(label => label.id) : null),
        parentId
    }
    const response = fetch(`/api/task/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function deleteTask({ taskId }){
    const response = fetch(`/api/task/${taskId}`, {
        method: 'DELETE',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}