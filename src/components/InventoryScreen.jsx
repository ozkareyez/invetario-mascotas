import { useState, useMemo, useCallback } from 'react'
import FamilyCarousel from './FamilyCarousel'
import SearchInput from './SearchInput'
import ProductForm from './ProductForm'
import { exportInventory } from '../utils/exportExcel'
import CruceModal from './CruceModal'
import UbicacionesModal from './UbicacionesModal'
import { STORAGE_KEYS } from '../constants'

const FAMILIA_KEY = 'inventario_familia_filter'

export default function InventoryScreen({
  productos,
  conteo,
  conteoPosiciones,
  ubicaciones,
  onUpdateConteo,
  onReset,
}) {
  const [selectedFamily, setSelectedFamily] = useState(() => {
    try {
      return sessionStorage.getItem(FAMILIA_KEY) || null
    } catch {
      return null
    }
  })
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCruce, setShowCruce] = useState(false)
  const [showUbicaciones, setShowUbicaciones] = useState(false)

  const stats = useMemo(() => {
    const total = productos.length
    const contados = Object.keys(conteo).length
    const pendientes = total - contados
    const pctAvance = total > 0 ? Math.round((contados / total) * 100) : 0

    const conStock = productos.filter((p) => p.stock != null)
    const stockTeorico = conStock.reduce((s, p) => s + (p.stock ?? 0), 0)
    const stockFisico = conStock.reduce((s, p) => s + (conteo[p.id] ?? 0), 0)
    const diffTotal = stockTeorico - stockFisico

    const cotejables = conStock.filter((p) => conteo[p.id] != null)
    const coinciden = cotejables.filter((p) => conteo[p.id] === p.stock)
    const confiabilidad =
      cotejables.length > 0
        ? Math.round((coinciden.length / cotejables.length) * 100)
        : 0

    const conDiferencia = conStock.filter(
      (p) => conteo[p.id] != null && conteo[p.id] !== p.stock
    )

    const sobreStock = conStock.filter(
      (p) => conteo[p.id] != null && conteo[p.id] > p.stock
    )
    const faltaStock = conStock.filter(
      (p) => conteo[p.id] != null && conteo[p.id] < p.stock
    )

    return {
      total,
      contados,
      pendientes,
      pctAvance,
      stockTeorico,
      stockFisico,
      diffTotal,
      confiabilidad,
      conDiferencia: conDiferencia.length,
      sobreStock: sobreStock.length,
      faltaStock: faltaStock.length,
    }
  }, [productos, conteo])

  const handleFamilySelect = useCallback((familia) => {
    setSelectedFamily(familia)
    try {
      if (familia) {
        sessionStorage.setItem(FAMILIA_KEY, familia)
      } else {
        sessionStorage.removeItem(FAMILIA_KEY)
      }
    } catch {}
  }, [])

  const handleSelectProducto = useCallback((producto) => {
    setSelectedProducto(producto)
  }, [])

  const handleSave = useCallback(
    (id, cantidad, posKey, cantidadPosicion) => {
      onUpdateConteo(id, cantidad, posKey, cantidadPosicion)
    },
    [onUpdateConteo]
  )

  const handleDeselect = useCallback(() => {
    setSelectedProducto(null)
  }, [])

  const handleReset = () => {
    setShowResetConfirm(false)
    setSelectedProducto(null)
    onReset()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Toma de Inventario</h1>
            <p className="text-xs text-gray-500">
              {stats.contados} de {stats.total} productos contados
              {stats.pendientes > 0 && (
                <span className="text-amber-600">
                  {' · '}
                  {stats.pendientes} pendientes
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCruce(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium touch-manipulation"
            >
              Ver Cruce
            </button>
            <button
              onClick={() => setShowUbicaciones(true)}
              className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium touch-manipulation"
            >
              Ubicaciones
            </button>
            <button
              onClick={() => exportInventory(productos, conteo, ubicaciones, conteoPosiciones)}
              className="text-sm text-gray-600 hover:text-blue-800 font-medium touch-manipulation"
            >
              Descargar
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-sm text-gray-400 hover:text-red-600 underline touch-manipulation"
            >
              Reset
            </button>
          </div>
        </div>

        <FamilyCarousel
          productos={productos}
          selected={selectedFamily}
          onSelect={handleFamilySelect}
        />
      </header>

      <main className="flex-1 px-4 pt-3 pb-6 space-y-4">
        <SearchInput
          productos={
            selectedFamily
              ? productos.filter((p) => p.familia === selectedFamily)
              : productos
          }
          familiaFilter={null}
          onSelectProducto={handleSelectProducto}
        />

        {stats.contados > 0 && !selectedProducto && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Avance</p>
              <p className="text-lg font-bold text-gray-900">{stats.pctAvance}%</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${stats.pctAvance}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats.contados}/{stats.total}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Confiabilidad</p>
              <p className="text-lg font-bold text-gray-900">{stats.confiabilidad}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.conDiferencia} con diferencias
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Stock vs Físico</p>
              <p className="text-sm font-bold text-gray-900">
                ${stats.stockTeorico.toLocaleString()} / ${stats.stockFisico.toLocaleString()}
              </p>
              {stats.diffTotal !== 0 && (
                <p
                  className={`text-xs font-semibold mt-0.5 ${
                    stats.diffTotal > 0 ? 'text-red-600' : 'text-orange-600'
                  }`}
                >
                  {stats.diffTotal > 0
                    ? `Faltante: ${stats.diffTotal}`
                    : `Sobrante: ${Math.abs(stats.diffTotal)}`}
                </p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Diferencias</p>
              <div className="flex gap-2 text-sm font-bold">
                <span className="text-red-600">-{stats.faltaStock}</span>
                <span className="text-gray-300">|</span>
                <span className="text-orange-600">+{stats.sobreStock}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                faltan / sobran
              </p>
            </div>
          </div>
        )}

        <ProductForm
          producto={selectedProducto}
          conteoActual={conteo}
          conteoPosiciones={conteoPosiciones}
          onSave={handleSave}
          onDeselect={handleDeselect}
        />
      </main>

      {showCruce && (
        <CruceModal
          productos={productos}
          conteo={conteo}
          conteoPosiciones={conteoPosiciones}
          ubicaciones={ubicaciones}
          onClose={() => setShowCruce(false)}
        />
      )}

      {showUbicaciones && (
        <UbicacionesModal
          productos={productos}
          ubicaciones={ubicaciones}
          conteoPosiciones={conteoPosiciones}
          onClose={() => setShowUbicaciones(false)}
        />
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2">¿Subir nuevo Excel?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Esto borrará todos los productos y el conteo actual. ¿Estás seguro?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-lg text-gray-700 font-medium touch-manipulation"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-600 rounded-lg text-white font-medium touch-manipulation"
              >
                Borrar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
