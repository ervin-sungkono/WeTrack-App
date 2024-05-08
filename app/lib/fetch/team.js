export const getAllTeamMember = ({ projectId }) => {
    const response = fetch(`/api/task/${projectId}/team`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export const addTeam = ({ teams, projectId }) => {
    const teamList = JSON.parse(teams).map(user => user.value)
    if(!teamList) return

    const response = fetch(`/api/project/${projectId}/team`, {
        method: 'POST',
        body: JSON.stringify({
            teams: teamList
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export const updateRole = ({ role, projectId, teamId }) => {
    const response = fetch(`/api/project/${projectId}/team/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify({
            role: role
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export const deleteTeamMember = ({ projectId, teamId }) => {
    const response = fetch(`/api/project/${projectId}/team/${teamId}`, {
        method: 'DELETE',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}