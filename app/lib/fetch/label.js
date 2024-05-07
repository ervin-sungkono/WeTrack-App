// export const getAllLabel = ({ projectId }) => {
//     const response = fetch(`/api/task/${projectId}/label`,{
//         method: 'GET',
//     })
//     .then(res => res.json())
//     .catch(err => console.log(err))

//     return response
// }

export const addLabel = ({ content, backgroundColor, projectId }) => {
    const response = fetch(`/api/project/${projectId}/label`, {
        method: 'POST',
        body: JSON.stringify({
            content,
            backgroundColor
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export const updateLabel = ({ content, backgroundColor, projectId, labelId }) => {
    const response = fetch(`/api/project/${projectId}/label/${labelId}`, {
        method: 'PUT',
        body: JSON.stringify({
            content,
            backgroundColor
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export const deleteLabel = ({ projectId, labelId }) => {
    const response = fetch(`/api/project/${projectId}/label/${labelId}`, {
        method: 'DELETE',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}