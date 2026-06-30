import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

export function useSupabaseData(roomCode) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (!roomCode) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const fetchData = async () => {
      const { data: row, error: fetchError } = await supabase
        .from('inventarios')
        .select('*')
        .eq('id', roomCode)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setData(row)
      }
      setLoading(false)
    }

    fetchData()

    const channel = supabase
      .channel(`inventarios:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventarios',
          filter: `id=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setError('Sala eliminada')
          } else {
            setData(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  const updateConteo = useCallback(
    async (id, cantidad, posKey, cantidadPosicion) => {
      if (!roomCode) return
      const current = dataRef.current
      if (!current) return

      const newConteo = { ...current.conteo, [id]: cantidad }
      const newConteoPos = { ...current.conteo_posiciones }

      if (posKey !== undefined && cantidadPosicion !== undefined) {
        newConteoPos[id] = { ...(newConteoPos[id] || {}), [posKey]: cantidadPosicion }
      }

      const updates = { conteo: newConteo }
      if (posKey !== undefined) {
        updates.conteo_posiciones = newConteoPos
      }

      const { error: updateError } = await supabase
        .from('inventarios')
        .update(updates)
        .eq('id', roomCode)

      if (updateError) {
        setError(updateError.message)
      } else {
        const optimisticData = { ...current, ...updates }
        dataRef.current = optimisticData
        setData(optimisticData)
      }
    },
    [roomCode]
  )

  const resetConteo = useCallback(async () => {
    if (!roomCode) return
    const { error: resetError } = await supabase
      .from('inventarios')
      .update({ conteo: {}, conteo_posiciones: {} })
      .eq('id', roomCode)
    if (resetError) {
      setError(resetError.message)
    } else {
      setData((prev) =>
        prev ? { ...prev, conteo: {}, conteo_posiciones: {} } : prev
      )
    }
  }, [roomCode])

  const clearError = useCallback(() => setError(null), [])

  return {
    productos: data?.productos || [],
    conteo: data?.conteo || {},
    conteoPosiciones: data?.conteo_posiciones || {},
    ubicaciones: data?.ubicaciones || {},
    updateConteo,
    resetConteo,
    clearError,
    loading,
    error,
  }
}
