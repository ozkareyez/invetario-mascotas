import { useState, useEffect, useRef } from 'react'
import { POSICIONES } from '../constants'

export default function ProductForm({
  producto,
  conteoActual,
  conteoPosiciones,
  onSave,
  onDeselect,
}) {
  const [cantidad, setCantidad] = useState('')
  const [pasillo, setPasillo] = useState('')
  const [posicion, setPosicion] = useState('')
  const inputRef = useRef(null)

  const posicionesPrevias = producto ? conteoPosiciones?.[producto.id] : null
  const totalPrevias = posicionesPrevias
    ? Object.values(posicionesPrevias).reduce((s, v) => s + v, 0)
    : 0

  useEffect(() => {
    if (producto) {
      setCantidad('')
      setPasillo('')
      setPosicion('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [producto])

  if (!producto) return null

  const posKey = pasillo || posicion ? `${pasillo || ''}|${posicion || ''}` : undefined

  const handleSubmit = (e) => {
    e.preventDefault()
    const num = parseInt(cantidad, 10)
    if (isNaN(num) || num < 0) return
    const totalActual = conteoActual[producto.id] ?? 0
    const prevEnPos = posKey && posicionesPrevias?.[posKey]
    const nuevoTotal = prevEnPos !== undefined
      ? totalActual - prevEnPos + num
      : posKey
        ? totalActual + num
        : num

    onSave(producto.id, nuevoTotal, posKey, num)
    onDeselect()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {producto.nombre}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-mono">{producto.id}</span>
            {' · '}
            {producto.familia}
          </p>
        </div>
        <button
          type="button"
          onClick={onDeselect}
          className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pasillo
        </label>
        <input
          type="text"
          value={pasillo}
          onChange={(e) => setPasillo(e.target.value.toUpperCase())}
          placeholder="Ej: A, B, C..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          autoComplete="off"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Posición
        </label>
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setPosicion('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium touch-manipulation transition-colors ${
              posicion === ''
                ? 'bg-gray-200 text-gray-500'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            —
          </button>
          {POSICIONES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setPosicion(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold touch-manipulation transition-colors ${
                posicion === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad Física
        </label>
        <input
          ref={inputRef}
          type="number"
          min="0"
          inputMode="numeric"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="0"
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={!cantidad || parseInt(cantidad, 10) < 0}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
      >
        Guardar
      </button>

      {posicionesPrevias && Object.keys(posicionesPrevias).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Conteo por posición:</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(posicionesPrevias).map(([pk, qty]) => {
              const [p, r] = pk.split('|')
              const label = p && r ? `${p}-${r}` : p || r
              return (
                <span
                  key={pk}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${
                    pk === posKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="font-semibold">{label}</span>
                  <span className="font-bold">= {qty}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {conteoActual[producto.id] !== undefined && !posicionesPrevias && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Cantidad registrada: <strong>{conteoActual[producto.id]}</strong>
        </p>
      )}
    </form>
  )
}
