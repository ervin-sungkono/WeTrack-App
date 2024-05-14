export function addAttachment({ taskId, attachments }){
    let formData = new FormData()
    formData.enctype = "multipart/form-data"
    attachments.forEach(attachment => {
        formData.append("attachments", attachment)
    })
    
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