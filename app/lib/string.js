// Function untuk manipulasi string masuk disini
export const sanitizeName = (name) => {
    return name.trim().split(/\s+/).map(d => d[0].toUpperCase() + d.slice(1)).join(' ')
}

export const removeTrailingSlash = (str) => {
    return str.replace(/\/+$/, '')
}

export const generateProjectKey = (projectName) => {
    const tempList = projectName.trim().split(/\s+/)
    const generatedKey = (tempList.length > 1) ? 
        tempList.map(d => d[0].toUpperCase()).join('').slice(0,7) : 
        tempList[0].slice(0,2).toUpperCase()
    return generatedKey
}