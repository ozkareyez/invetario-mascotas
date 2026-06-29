import { useMemo, useState } from 'react'

export default function CruceModal({
  productos,
  conteo,
  conteoPosiciones,
  ubicaciones,
  onClose,
}) {
  const [filter, setFilter] = useState('todas')
  const [sortBy, setSortBy] = useState('nombre')
  const [sortDir, setSortDir] = useState('asc')

  const lineas = useMemo(() => {
    const data = productos.map((p) => {
      const fisico = conteo[p.id] ?? 0
      const teorico = p.stock ?? 0
      return {
        ...p,
        teorico,
        fisico,
        diferencia: teorico - fisico,
      }
    })
    return data.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'nombre') cmp = a.nombre.localeCompare(b.nombre)
      else if (sortBy === 'diferencia') cmp = a.diferencia - b.diferencia
      else if (sortBy === 'sku') cmp = a.id.localeCompare(b.id)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [productos, conteo, sortBy, sortDir])

  const filtered = useMemo(() => {
    if (filter === 'todas') return lineas
    if (filter === 'diferencias') return lineas.filter((l) => l.diferencia !== 0)
    if (filter === 'pendientes') return lineas.filter((l) => l.fisico === 0 && conteo[l.id] === undefined)
    if (filter === 'sin_stock') return lineas.filter((l) => l.stock === null)
    return lineas
  }, [lineas, filter, conteo])

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col overflow-hidden">
      <div className="bg-white flex flex-col flex-1 max-w-3xl w-full mx-auto min-h-0">
        <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Cruce de Inventario</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 touch-manipulation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'diferencias', label: 'Con diferencias' },
              { key: 'pendientes', label: 'Pendientes' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap touch-manipulation ${
                  filter === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="text-left px-3 py-2 font-medium text-gray-500 cursor-pointer touch-manipulation"
                  onClick={() => toggleSort('sku')}
                >
                  SKU <SortIcon field="sku" />
                </th>
                <th
                  className="text-left px-3 py-2 font-medium text-gray-500 cursor-pointer touch-manipulation"
                  onClick={() => toggleSort('nombre')}
                >
                  Nombre <SortIcon field="nombre" />
                </th>
                <th className="text-center px-2 py-2 font-medium text-gray-500">Stock</th>
                <th className="text-center px-2 py-2 font-medium text-gray-500">Físico</th>
                <th
                  className="text-center px-2 py-2 font-medium text-gray-500 cursor-pointer touch-manipulation"
                  onClick={() => toggleSort('diferencia')}
                >
                  Diff <SortIcon field="diferencia" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className={`border-b border-gray-100 ${
                    l.diferencia !== 0 && l.stock !== null
                      ? 'bg-red-50'
                      : l.fisico === 0 && conteo[l.id] === undefined
                      ? 'bg-amber-50'
                      : ''
                  }`}
                >
                  <td className="px-3 py-2 text-xs font-mono text-gray-500">{l.id}</td>
                  <td className="px-3 py-2 text-gray-900">{l.nombre}</td>
                  <td className="px-2 py-2 text-center font-mono">{l.stock ?? '—'}</td>
                  <td className="px-2 py-2 text-center font-mono">{l.fisico || '—'}</td>
                  <td
                    className={`px-2 py-2 text-center font-mono font-semibold ${
                      l.diferencia > 0
                        ? 'text-red-600'
                        : l.diferencia < 0
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}
                  >
                    {l.stock !== null
                      ? l.diferencia > 0
                        ? `-${l.diferencia}`
                        : l.diferencia < 0
                        ? `+${Math.abs(l.diferencia)}`
                        : '0'
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">Sin resultados</p>
          )}
        </div>

        <footer className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-sm text-gray-500 flex justify-between">
          <span>
            {filtered.length} de {lineas.length} productos
          </span>
          <span className="font-medium">
            {lineas.filter((l) => l.diferencia !== 0 && l.stock !== null).length} con diferencias
          </span>
        </footer>
      </div>
    </div>
  )
}
