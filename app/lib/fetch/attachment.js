export function addAttachment({ taskId, attachment }){
    let formData = new FormData()
    formData.enctype = "multipart/form-data"
    formData.append("attachment", attachment)
    
    const response = fetch(`/api/task/${taskId}/attachment`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function deleteAttachment({ taskId, attachmentId }){
    const response = fetch(`/api/task/${taskId}/attachment/${attachmentId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}