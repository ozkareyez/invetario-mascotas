import { useEffect } from 'react'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'

export default function BarcodeScanner({ onScan, onClose, onError }) {
  const { scanning, startScanning, stopScanning, containerId } =
    useBarcodeScanner({
      onScan,
      onError,
    })

  useEffect(() => {
    startScanning()
    return () => stopScanning()
  }, [startScanning, stopScanning])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <span className="text-white text-sm font-medium">
          Escanea un código de barras
        </span>
        <button
          onClick={onClose}
          className="text-white bg-white/20 rounded-full px-4 py-1.5 text-sm touch-manipulation"
        >
          Cancelar
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div
          id={containerId}
          className={`w-full max-w-sm aspect-square ${scanning ? '' : 'hidden'}`}
        />
        {!scanning && (
          <div className="absolute text-white text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Iniciando cámara...</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/80 text-center">
        <p className="text-gray-400 text-xs">
          Apunta el código de barras al centro de la pantalla
        </p>
      </div>
    </div>
  )
}
