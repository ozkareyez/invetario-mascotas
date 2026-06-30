import { useState, useCallback, useEffect } from 'react'
import UploadScreen from './components/UploadScreen'
import InventoryScreen from './components/InventoryScreen'
import RoomScreen from './components/RoomScreen'
import {
  useLocalStorage,
  setInStorage,
  removeFromStorage,
} from './hooks/useLocalStorage'
import { useRoom } from './hooks/useRoom'
import { useSupabaseData } from './hooks/useSupabaseData'
import { hasConfig } from './supabase'
import { STORAGE_KEYS } from './constants'

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-3 text-blue-600">
        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="font-medium">Conectando...</span>
      </div>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  // --- Supabase mode ---
  const { roomCode, createRoom, joinRoom, leaveRoom, loading: roomLoading, error: roomError } = useRoom()
  const fb = useSupabaseData(roomCode)

  useEffect(() => {
    if (fb.error) {
      const t = setTimeout(fb.clearError, 6000)
      return () => clearTimeout(t)
    }
  }, [fb.error, fb.clearError])

  // --- localStorage mode (fallback) ---
  const [localProductos, setLocalProductos, removeLocalProductos] = useLocalStorage(
    STORAGE_KEYS.PRODUCTOS, null
  )
  const [localConteo, setLocalConteo] = useLocalStorage(STORAGE_KEYS.CONTEO, {})
  const [localConteoPosiciones, setLocalConteoPosiciones] = useLocalStorage(
    STORAGE_KEYS.CONTEO_POSICIONES, {}
  )
  const [localUbicaciones, setLocalUbicaciones, removeLocalUbicaciones] = useLocalStorage(
    STORAGE_KEYS.UBICACIONES, {}
  )

  const handleLocalProductsLoaded = useCallback(
    (result) => {
      setLocalProductos(result.productos)
      setLocalUbicaciones(result.ubicaciones || {})
      setInStorage(STORAGE_KEYS.TIMESTAMP, new Date().toISOString())
    },
    [setLocalProductos]
  )

  const handleLocalUpdateConteo = useCallback(
    (id, cantidad, posKey, cantidadPosicion) => {
      setLocalConteo((prev) => ({ ...prev, [id]: cantidad }))
      if (posKey !== undefined && cantidadPosicion !== undefined) {
        setLocalConteoPosiciones((prev) => ({
          ...prev,
          [id]: { ...prev[id], [posKey]: cantidadPosicion },
        }))
      }
    },
    [setLocalConteo, setLocalConteoPosiciones]
  )

  const handleLocalReset = useCallback(() => {
    removeLocalProductos()
    removeLocalUbicaciones()
    removeFromStorage(STORAGE_KEYS.CONTEO)
    removeFromStorage(STORAGE_KEYS.CONTEO_POSICIONES)
    removeFromStorage(STORAGE_KEYS.TIMESTAMP)
  }, [removeLocalProductos, removeLocalUbicaciones])

  const handleCreateRoom = useCallback(
    async (productos, ubicaciones) => {
      const code = await createRoom(productos, ubicaciones)
      return code
    },
    [createRoom]
  )

  if (!ready) return null

  // ===================== Supabase mode =====================
  if (hasConfig) {
    if (!roomCode) {
      return (
        <RoomScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={joinRoom}
          loading={roomLoading}
          error={roomError}
        />
      )
    }

    if (fb.loading) return <Loading />

    return (
      <>
        {fb.error && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 px-4 text-sm font-medium">
            {fb.error}
          </div>
        )}
        <InventoryScreen
          productos={fb.productos}
          conteo={fb.conteo}
          conteoPosiciones={fb.conteoPosiciones}
          ubicaciones={fb.ubicaciones}
          onUpdateConteo={fb.updateConteo}
          onReset={fb.resetConteo}
          roomCode={roomCode}
          onLeaveRoom={leaveRoom}
        />
      </>
    )
  }

  // ===================== localStorage mode =====================
  if (!localProductos || localProductos.length === 0) {
    return <UploadScreen onProductsLoaded={handleLocalProductsLoaded} />
  }

  return (
    <InventoryScreen
      productos={localProductos}
      conteo={localConteo}
      conteoPosiciones={localConteoPosiciones}
      ubicaciones={localUbicaciones}
      onUpdateConteo={handleLocalUpdateConteo}
      onReset={handleLocalReset}
    />
  )
}
