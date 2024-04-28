export function getAllTaskStatus(projectId){
    const response = fetch(`/api/task/status?projectId=${projectId}`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}