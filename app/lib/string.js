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
    { label: "Tidak ada", value: 0, color: '#A9A9A9' },
    { label: "Rendah", value: 1, color: '#006400' },
    { label: "Sedang", value: 2, color: '#FFBF00' },
    { label: "Tinggi", value: 3, color: '#D2222D' }
]

export const getPriority = (priority) => {
    return priorityList[priority]
}

export const progressList = [
    { label: "Belum Dimulai", color: '#A9A9A9' },
    { label: "Dalam Proses", color: '#FFBF00' },
    { label: "Selesai", color: '#006400' },
    { label: "Terlambat", color: '#D2222D' }
]

export const getProgress = (progress) => {
    return progressList.find(d => d.label === progress)
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