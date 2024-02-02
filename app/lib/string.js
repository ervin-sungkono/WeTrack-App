// Function untuk manipulasi string masuk disini

export const sanitizeName = (name) => {
    return name.split(/\s+/).map(d => d[0].toUpperCase() + d.slice(1)).join(' ')
}