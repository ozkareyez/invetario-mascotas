import { useEffect, useRef } from 'react'

export default function SearchDropdown({ results, query, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [onClose])

  if (!query.trim()) return null

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto"
    >
      {results.length === 0 ? (
        <div className="p-4 text-center text-gray-400 text-sm">
          No se encontraron productos para "{query}"
        </div>
      ) : (
        results.slice(0, 50).map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-blue-50 active:bg-blue-100 transition-colors touch-manipulation"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{p.nombre}</span>
              <span className="text-xs text-gray-400 font-mono ml-2">{p.id}</span>
            </div>
            <span className="text-xs text-gray-500">{p.familia}</span>
          </button>
        ))
      )}
    </div>
  )
}
