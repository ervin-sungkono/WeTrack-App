export function getProjectByID(id){
    const response = fetch(`/api/project/${id}`,{
        method: 'GET'
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function getRecentProjects(){
    const response = fetch('/api/project/recent',{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function getAllProject(){
    const response = fetch('/api/project',{
        method: 'GET',
        next: { revalidate: 600, tags: ['projects'] }
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function createNewProject({ projectName, key }){
    const payload = {
        projectName,
        key
    }

    const response = fetch('/api/project',{
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function generateTask({ projectDescription }){
    const payload = {
        projectDescription: projectDescription.trim()
    }

    const response = fetch('/api/project/generate-task',{
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function getProjectTeam(id){
    const response = fetch(`/api/project/${id}/team`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}

export function inviteMember({projectId, teams, role}){
    const payload = {
        teams: teams ? JSON.parse(teams).map(user => user.value) : null,
        role: role
    }
    const response = fetch(`/api/project/${projectId}/team`,{
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}

export function updateRole({projectId, teamId, role}){
    const payload = {
        role: role
    }
    const response = fetch(`/api/project/${projectId}/team/${teamId}`,{
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}

export function deleteMember({projectId, teamId}){
    const response = fetch(`/api/project/${projectId}/team/${teamId}`,{
        method: 'DELETE',
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}

export function updateProject({projectId, projectName, key, startStatus, endStatus}){
    const payload = {
        projectName,
        key,
        startStatus,
        endStatus
    }
    const response = fetch(`/api/project/${projectId}`,{
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}

export function deleteProject({id}){
    const response = fetch(`/api/project/${id}`,{
        method: 'DELETE',
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}