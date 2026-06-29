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
  const [conteoPosiciones, setConteoPosiciones] = useLocalStorage(
    STORAGE_KEYS.CONTEO_POSICIONES,
    {}
  )
  const [ubicaciones, setUbicaciones, removeUbicaciones] = useLocalStorage(
    STORAGE_KEYS.UBICACIONES,
    {}
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const handleProductsLoaded = useCallback(
    (result) => {
      setProductos(result.productos)
      setUbicaciones(result.ubicaciones || {})
      setInStorage(STORAGE_KEYS.TIMESTAMP, new Date().toISOString())
    },
    [setProductos, setUbicaciones]
  )

  const handleUpdateConteo = useCallback(
    (id, cantidad, posKey, cantidadPosicion) => {
      setConteo((prev) => ({ ...prev, [id]: cantidad }))
      if (posKey !== undefined && cantidadPosicion !== undefined) {
        setConteoPosiciones((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            [posKey]: cantidadPosicion,
          },
        }))
      }
    },
    [setConteo, setConteoPosiciones]
  )

  const handleReset = useCallback(() => {
    removeProductos()
    removeUbicaciones()
    removeFromStorage(STORAGE_KEYS.CONTEO)
    removeFromStorage(STORAGE_KEYS.CONTEO_POSICIONES)
    removeFromStorage(STORAGE_KEYS.TIMESTAMP)
  }, [removeProductos, removeUbicaciones])

  if (!ready) return null

  if (!productos || productos.length === 0) {
    return <UploadScreen onProductsLoaded={handleProductsLoaded} />
  }

  return (
    <InventoryScreen
      productos={productos}
      conteo={conteo}
      conteoPosiciones={conteoPosiciones}
      ubicaciones={ubicaciones}
      onUpdateConteo={handleUpdateConteo}
      onReset={handleReset}
    />
  )
}
