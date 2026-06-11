import { useState, useMemo, useCallback } from 'react'
import { createSearcher, searchProducts } from '../utils/fuzzySearch'
import SearchDropdown from './SearchDropdown'
import BarcodeScanner from './BarcodeScanner'

export default function SearchInput({
  productos,
  familiaFilter,
  onSelectProducto,
  scannedCode,
  onScanComplete,
}) {
  const [query, setQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [scannerError, setScannerError] = useState(null)

  const searcher = useMemo(() => createSearcher(productos), [productos])

  const results = useMemo(
    () => searchProducts(searcher, query, familiaFilter),
    [searcher, query, familiaFilter]
  )

  const handleSelect = useCallback(
    (producto) => {
      setQuery('')
      onSelectProducto(producto)
    },
    [onSelectProducto]
  )

  const handleBarcodeScan = useCallback(
    (code) => {
      const match = productos.find((p) => p.id === code)
      if (match) {
        onSelectProducto(match)
      } else {
        setScannerError(`Código "${code}" no encontrado en el catálogo`)
        setTimeout(() => setScannerError(null), 3000)
      }
    },
    [productos, onSelectProducto]
  )

  const handleBarcodeError = useCallback(
    (msg) => {
      setScannerError(msg)
      setTimeout(() => setScannerError(null), 3000)
    },
    []
  )

  const handleCloseScanner = () => setShowScanner(false)

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por SKU, nombre o familia..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            autoComplete="off"
          />
          <SearchDropdown
            results={results}
            query={query}
            onSelect={handleSelect}
            onClose={() => setQuery('')}
          />
        </div>

        <button
          onClick={() => setShowScanner(true)}
          className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation"
          title="Escanear código de barras"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </button>
      </div>

      {scannerError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {scannerError}
        </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={handleCloseScanner}
          onError={handleBarcodeError}
        />
      )}
    </div>
  )
}
