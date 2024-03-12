import { useState } from "react"

const useSessionStorage = (key, initialValue) => {
  const [state, setState] = useState(() => {
    // Initialize the state
    try {
      const value = window.sessionStorage.getItem(key)
      // Check if the local storage already has any values,
      // otherwise initialize it with the passed initialValue
      return value ? JSON.parse(value) : initialValue
    } catch (error) {
      console.log(error)
    }
  })

  const setValue = value => {
    try {
      // If the passed value is a callback function,
      //  then call it with the existing state.
      const valueToStore = value instanceof Function ? value(state) : value
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      setState(value)
    } catch (error) {
      console.log(error)
    }
  }

  return [state, setValue]
}

export default useSessionStorage