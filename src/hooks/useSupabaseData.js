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
        console.error('Error fetching data:', fetchError)
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
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime subscription error:', status)
          setError('Error de conexión en tiempo real')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  const updateConteo = useCallback(
    async (id, cantidad, posKey, cantidadPosicion) => {
      if (!roomCode) return
      const current = dataRef.current
      if (!current) return

      try {
        if (posKey !== undefined && cantidadPosicion !== undefined) {
          const newConteoPos = { ...current.conteo_posiciones }
          if (!newConteoPos[id]) newConteoPos[id] = {}
          newConteoPos[id][posKey] = cantidadPosicion
          const valores = Object.values(newConteoPos[id])
          const nuevoTotal = valores.reduce((s, v) => s + v, 0)
          const updates = {
            conteo: { ...current.conteo, [id]: nuevoTotal },
            conteo_posiciones: newConteoPos,
          }

          const { error: updateError } = await supabase
            .from('inventarios')
            .update(updates)
            .eq('id', roomCode)

          if (updateError) {
            console.error('Error actualizando conteo:', updateError)
            setError(updateError.message)
            return
          }

          const optimisticData = { ...current, ...updates }
          dataRef.current = optimisticData
          setData(optimisticData)
        } else {
          const updates = { conteo: { ...current.conteo, [id]: cantidad } }

          const { error: updateError } = await supabase
            .from('inventarios')
            .update(updates)
            .eq('id', roomCode)

          if (updateError) {
            console.error('Error updating conteo:', updateError)
            setError(updateError.message)
          } else {
            const optimisticData = { ...current, ...updates }
            dataRef.current = optimisticData
            setData(optimisticData)
          }
        }
      } catch (err) {
        console.error('Unexpected error in updateConteo:', err)
        setError(err.message)
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
      console.error('Error resetting conteo:', resetError)
      setError(resetError.message)
    } else {
      setData((prev) =>
        prev ? { ...prev, conteo: {}, conteo_posiciones: {} } : prev
      )
    }
  }, [roomCode])

  const clearError = useCallback(() => setError(null), [])

  const refetch = useCallback(async () => {
    if (!roomCode) return
    const { data: row, error: fetchError } = await supabase
      .from('inventarios')
      .select('*')
      .eq('id', roomCode)
      .single()
    if (fetchError) {
      console.error('Error refetching:', fetchError)
      setError(fetchError.message)
    } else {
      setData(row)
    }
  }, [roomCode])

  return {
    productos: data?.productos || [],
    conteo: data?.conteo || {},
    conteoPosiciones: data?.conteo_posiciones || {},
    ubicaciones: data?.ubicaciones || {},
    updateConteo,
    resetConteo,
    clearError,
    refetch,
    loading,
    error,
  }
}
