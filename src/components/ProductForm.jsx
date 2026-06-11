import { useState, useEffect, useRef } from 'react'

export default function ProductForm({
  producto,
  conteoActual,
  onSave,
  onDeselect,
}) {
  const [cantidad, setCantidad] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (producto) {
      setCantidad(conteoActual?.[producto.id]?.toString() || '')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [producto, conteoActual])

  if (!producto) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const num = parseInt(cantidad, 10)
    if (isNaN(num) || num < 0) return
    onSave(producto.id, num)
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
        <label
          htmlFor="cantidad"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Cantidad Física
        </label>
        <input
          ref={inputRef}
          id="cantidad"
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

      {conteoActual?.[producto.id] !== undefined && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Este producto ya fue registrado con cantidad anterior:{' '}
          <strong>{conteoActual[producto.id]}</strong>
        </p>
      )}
    </form>
  )
}
