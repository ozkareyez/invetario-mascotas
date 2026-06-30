import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

export function useSupabaseData(roomCode) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const pendingRef = useRef(false)

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
      if (!roomCode || !data) return
      const newConteo = { ...data.conteo, [id]: cantidad }
      const newConteoPos = { ...data.conteo_posiciones }

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

      if (updateError) setError(updateError.message)
    },
    [roomCode, data]
  )

  const resetConteo = useCallback(async () => {
    if (!roomCode) return
    const { error: resetError } = await supabase
      .from('inventarios')
      .update({ conteo: {}, conteo_posiciones: {} })
      .eq('id', roomCode)
    if (resetError) setError(resetError.message)
  }, [roomCode])

  return {
    productos: data?.productos || [],
    conteo: data?.conteo || {},
    conteoPosiciones: data?.conteo_posiciones || {},
    ubicaciones: data?.ubicaciones || {},
    updateConteo,
    resetConteo,
    loading,
    error,
  }
}
