// Function untuk manipulasi string masuk disini

export const sanitizeName = (name) => {
    return name.trim().split(/\s+/).map(d => d[0].toUpperCase() + d.slice(1)).join(' ')
}

export const removeTrailingSlash = (str) => {
    return str.replace(/\/+$/, '')
}