import { useMemo } from 'react'

export default function FamilyCarousel({ productos, selected, onSelect }) {
  const familias = useMemo(() => {
    const set = new Set(productos.map((p) => p.familia))
    return ['Todas', ...Array.from(set).sort()]
  }, [productos])

  return (
    <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <div className="flex gap-2 px-1">
        {familias.map((familia) => (
          <button
            key={familia}
            onClick={() => onSelect(familia === 'Todas' ? null : familia)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-manipulation ${
              (familia === 'Todas' && !selected) || familia === selected
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {familia}
          </button>
        ))}
      </div>
    </div>
  )
}
