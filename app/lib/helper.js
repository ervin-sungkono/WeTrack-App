// Function untuk throttling ( bisa dipakai untuk search nanti )
export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(this, args) }, timeout)
  }
}

export const sortDateFn = ({ data, sortDirection = 'asc', key = 'createdAt' }) => {
  return [...data].sort((a, b) => {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export const sortValueFn = ({ data, sortDirection =  'asc', key }) => {
  return [...data].sort((a, b) => {
      return sortDirection === 'asc' ? a[key] - b[key] : b[key] - a[key];
  });
};

export const sortDateTimestampFn = ({ data, sortDirection = 'asc', key = 'createdAt' }) => {
  return [...data].sort((a, b) => {
      const dateA = new Date(a[key].seconds);
      const dateB = new Date(b[key].seconds);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
};