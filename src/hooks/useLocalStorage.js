import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {
        // localStorage full or unavailable
      }
    },
    [key, storedValue]
  )

  const remove = useCallback(() => {
    window.localStorage.removeItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, remove]
}

export function getFromStorage(key) {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export function setInStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // silent
  }
}

export function removeFromStorage(key) {
  window.localStorage.removeItem(key)
}
