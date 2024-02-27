export async function createNewProject({ projectName, key, createdBy }){
    const payload = {
        projectName,
        key,
        createdBy
    }

    const response = await fetch('/api/project',{
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}