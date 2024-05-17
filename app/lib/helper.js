// Function untuk throttling ( bisa dipakai untuk search nanti )
export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(this, args) }, timeout)
  }
}

export const sortDateFn = ({ data, sortDirection = 'asc', key='createdAt' }) => {
  if(sortDirection === 'asc') return data.sort((a,b) => (new Date(a[`${key}`]) - new Date(b[`${key}`])))
  if(sortDirection === 'desc') return data.sort((a,b) => (new Date(b[`${key}`]) - new Date(a[`${key}`])))
}

export const sortDateTimestampFn = ({ data, sortDirection = 'asc', key='createdAt' }) => {
  if(sortDirection === 'asc') return data.sort((a,b) => (new Date(a[`${key}`].seconds) - new Date(b[`${key}`].seconds)))
  if(sortDirection === 'desc') return data.sort((a,b) => (new Date(b[`${key}`].seconds) - new Date(a[`${key}`].seconds)))
}