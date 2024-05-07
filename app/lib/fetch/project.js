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
        next: { revalidate: 3600, tags: ['projects'] }
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}

export function createNewProject({ projectName, key, teams }){
    const payload = {
        projectName,
        key,
        teams: teams ? JSON.parse(teams).map(user => user.value) : null,
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

export function inviteMember({email}){
    const payload = {
        email: email
    }
    const response = fetch(`/api/project/${id}/team`,{
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}

export function updateRole({role}){
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

export function deleteMember(){
    const response = fetch(`/api/project/${projectId}/team/${teamId}`,{
        method: 'DELETE',
    })
    .then(res => res.json())
    .catch(err => console.log(err))
    return response
}