import { useMemo, useState } from 'react'

export default function UbicacionesModal({
  productos,
  ubicaciones,
  conteoPosiciones,
  onClose,
}) {
  const [filter, setFilter] = useState('multi')
  const [search, setSearch] = useState('')

  const items = useMemo(() => {
    const hasUbicaciones = Object.keys(ubicaciones).length > 0
    const hasConteoPos = Object.keys(conteoPosiciones || {}).length > 0

    if (!hasUbicaciones && !hasConteoPos) return []

    const list = productos
      .filter((p) => ubicaciones[p.id] || conteoPosiciones?.[p.id])
      .map((p) => {
        const ubic = ubicaciones[p.id] || []
        const conteo = conteoPosiciones?.[p.id]
        const conteoList = conteo
          ? Object.entries(conteo).map(([pk, qty]) => {
              const [pas, pos] = pk.split('|')
              return { pasillo: pas || '', posicion: pos || '', stock: qty }
            })
          : []

        const todas = [
          ...ubic.map((u) => ({ ...u, tipo: 'catálogo' })),
          ...conteoList.map((u) => ({ ...u, tipo: 'conteo' })),
        ]

        const numUnicas = new Set(
          todas.map((u) => `${u.pasillo}|${u.posicion}`)
        ).size

        return {
          ...p,
          numUbicaciones: numUnicas,
          ubicacionesCat: ubic,
          ubicacionesConteo: conteoList,
          todas,
        }
      })

    const filtered = list.filter((item) => {
      if (filter === 'multi') return item.numUbicaciones > 1
      if (filter === 'single') return item.numUbicaciones === 1
      return true
    })

    if (search.trim()) {
      const q = search.toLowerCase()
      return filtered.filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.nombre.toLowerCase().includes(q)
      )
    }

    return filtered.sort((a, b) => b.numUbicaciones - a.numUbicaciones)
  }, [productos, ubicaciones, conteoPosiciones, filter, search])

  const totalConUbicacion = Object.keys(ubicaciones).length
  const totalConConteoPos = Object.keys(conteoPosiciones || {}).length
  const multiPosicion = Object.values(ubicaciones).filter((u) => u.length > 1).length

  if (!Object.keys(ubicaciones).length && !Object.keys(conteoPosiciones || {}).length) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex flex-col overflow-hidden">
        <div className="bg-white flex flex-col flex-1 max-w-3xl w-full mx-auto min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Ubicaciones</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 touch-manipulation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-gray-400 text-center">
              No hay datos de ubicación. Agrega las columnas 'pasillo' y 'posicion' en tu Excel,
              o ingresa la posición al tomar el inventario.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col overflow-hidden">
      <div className="bg-white flex flex-col flex-1 max-w-3xl w-full mx-auto min-h-0">
        <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Ubicaciones</h2>
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
              { key: 'multi', label: `Multi-posición (${multiPosicion})` },
              { key: 'todas', label: `Todas (${totalConUbicacion})` },
              { key: 'single', label: `Una posición` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap touch-manipulation ${
                  filter === f.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-2 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por SKU o nombre..."
              className="w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-500">SKU</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Nombre</th>
                <th className="text-center px-2 py-2 font-medium text-gray-500">#</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Ubicaciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 ${
                    item.numUbicaciones > 1 ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 text-xs font-mono text-gray-500">{item.id}</td>
                  <td className="px-3 py-2 text-gray-900 max-w-[200px] truncate">{item.nombre}</td>
                  <td className="px-2 py-2 text-center font-mono font-semibold">
                    {item.numUbicaciones}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {item.ubicacionesCat.map((u, i) => (
                        <span
                          key={`cat-${i}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono"
                        >
                          <span className="text-gray-500">{u.pasillo || '?'}</span>
                          <span className="text-gray-700 font-semibold">{u.posicion || '?'}</span>
                          {u.stock !== null && (
                            <span className="text-gray-400 ml-0.5">({u.stock})</span>
                          )}
                        </span>
                      ))}
                      {item.ubicacionesConteo.map((u, i) => (
                        <span
                          key={`cto-${i}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs font-mono"
                        >
                          <span className="text-gray-500">{u.pasillo || '?'}</span>
                          <span className="text-blue-700 font-semibold">{u.posicion || '?'}</span>
                          <span className="text-blue-600 ml-0.5">={u.stock}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              {filter === 'multi'
                ? 'No hay productos en múltiples posiciones'
                : 'Sin resultados'}
            </p>
          )}
        </div>

        <footer className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-sm text-gray-500 flex justify-between">
          <div className="space-x-3">
            <span>{items.length} productos</span>
            {totalConConteoPos > 0 && (
              <span className="text-blue-600">{totalConConteoPos} con posición asignada</span>
            )}
          </div>
          <span className="font-medium">{multiPosicion} en multi-posición</span>
        </footer>
      </div>
    </div>
  )
}
