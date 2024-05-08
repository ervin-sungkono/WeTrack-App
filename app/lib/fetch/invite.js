export const acceptInvite = ({ projectId }) => {
    const response = fetch(`/api/project/${projectId}/invite/accept`, {
        method: 'GET'
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export const rejectInvite = ({ projectId }) => {
    const response = fetch(`/api/project/${projectId}/invite/reject`, {
        method: 'GET'
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}