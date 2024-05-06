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

export const priorityList = [
    { label: "Tidak ada", value: 0 },
    { label: "Rendah", value: 1 },
    { label: "Sedang", value: 2 },
    { label: "Tinggi", value: 3 }
]

export const getPriority = (priority) => {
    return priorityList[priority].label
}

export const extractUniqueMentionTags = (text) => {
    const pattern = /@\[([^[\]]+)]\(([^)]+)\)/g
    const dataArray = []

    // Extract Mention tags
    let match;
    while ((match = pattern.exec(text)) !== null) {
        const obj = {
            name: match[1],
            id: match[2]
        };
        dataArray.push(obj);
    }
    
    // Get Unique Mention Tags
    const seen = new Set();
    return dataArray.filter(obj => {
        const value = obj.id;
        return seen.has(value) ? false : seen.add(value);
    });
}

export const extractSingleMentionTag = (text) => {
    const pattern = /@\[([^[\]]+)]\(([^)]+)\)/g

    let match = pattern.exec(text)
    if(match !== null) {
        const obj = {
            name: match[1],
            id: match[2],
            mention: true,
        }
        return obj
    }
    else{
        return({
            content: text,
            mention: false
        })
    }
}