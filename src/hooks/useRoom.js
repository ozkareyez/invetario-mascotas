import { useState, useCallback, useEffect } from 'react'
import { supabase, hasConfig } from '../supabase'

const ROOM_KEY = 'inventario_room'

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function useRoom() {
  const [roomCode, setRoomCode] = useState(() => {
    try {
      return sessionStorage.getItem(ROOM_KEY) || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createRoom = useCallback(async (productos, ubicaciones) => {
    if (!hasConfig) {
      setError('Supabase no está configurado. Crea un archivo .env con tus credenciales.')
      return null
    }
    setLoading(true)
    setError(null)
    try {
      const code = generateRoomCode()
      const { error: insertError } = await supabase.from('inventarios').insert({
        id: code,
        productos,
        conteo: {},
        conteo_posiciones: {},
        ubicaciones,
      })
      if (insertError) throw insertError
      setRoomCode(code)
      try { sessionStorage.setItem(ROOM_KEY, code) } catch {}
      return code
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const joinRoom = useCallback(async (code) => {
    if (!hasConfig) {
      setError('Supabase no está configurado')
      return false
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('inventarios')
        .select('id')
        .eq('id', code.toUpperCase())
        .single()
      if (queryError || !data) {
        setError('Código de sala no encontrado')
        return false
      }
      setRoomCode(code.toUpperCase())
      try { sessionStorage.setItem(ROOM_KEY, code.toUpperCase()) } catch {}
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const leaveRoom = useCallback(() => {
    setRoomCode(null)
    try { sessionStorage.removeItem(ROOM_KEY) } catch {}
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) {
      joinRoom(room)
    }
  }, [joinRoom])

  return { roomCode, createRoom, joinRoom, leaveRoom, loading, error }
}
