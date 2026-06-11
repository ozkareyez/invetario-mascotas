import { useState, useCallback, useEffect } from 'react'
import UploadScreen from './components/UploadScreen'
import InventoryScreen from './components/InventoryScreen'
import {
  useLocalStorage,
  setInStorage,
  removeFromStorage,
} from './hooks/useLocalStorage'
import { STORAGE_KEYS } from './constants'

export default function App() {
  const [productos, setProductos, removeProductos] = useLocalStorage(
    STORAGE_KEYS.PRODUCTOS,
    null
  )
  const [conteo, setConteo] = useLocalStorage(STORAGE_KEYS.CONTEO, {})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const handleProductsLoaded = useCallback(
    (data) => {
      setProductos(data)
      setInStorage(STORAGE_KEYS.TIMESTAMP, new Date().toISOString())
    },
    [setProductos]
  )

  const handleUpdateConteo = useCallback(
    (id, cantidad) => {
      setConteo((prev) => ({ ...prev, [id]: cantidad }))
    },
    [setConteo]
  )

  const handleReset = useCallback(() => {
    removeProductos()
    removeFromStorage(STORAGE_KEYS.CONTEO)
    removeFromStorage(STORAGE_KEYS.TIMESTAMP)
  }, [removeProductos])

  if (!ready) return null

  if (!productos || productos.length === 0) {
    return <UploadScreen onProductsLoaded={handleProductsLoaded} />
  }

  return (
    <InventoryScreen
      productos={productos}
      conteo={conteo}
      onUpdateConteo={handleUpdateConteo}
      onReset={handleReset}
    />
  )
}
