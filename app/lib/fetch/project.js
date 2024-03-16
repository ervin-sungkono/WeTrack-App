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

export function createNewProject({ projectName, key, createdBy }){
    const payload = {
        projectName,
        key,
        createdBy
    }

    const response = fetch('/api/project',{
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}