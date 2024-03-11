export function getAllIssue(projectId){
    const response = fetch(`/api/issue?projectId=${projectId}`,{
        method: 'GET',
    })
    .then(res => res.json())
    .catch(err => console.log(err))

    return response
}