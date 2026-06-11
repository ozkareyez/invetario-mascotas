import { useState, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function useBarcodeScanner({ onScan, onError }) {
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)
  const mountedRef = useRef(false)
  const containerId = 'barcode-scanner-container'

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current.clear())
        .catch(() => {})
      scannerRef.current = null
    }
    setScanning(false)
  }, [])

  const startScanning = useCallback(async () => {
    if (scannerRef.current) return
    setScanning(true)
    // Esperar a que React renderice el DOM del contenedor
    await new Promise((resolve) => setTimeout(resolve, 50))
    if (!document.getElementById(containerId)) {
      setScanning(false)
      if (onError) onError('No se encontró el contenedor del escáner')
      return
    }
    try {
      const scanner = new Html5Qrcode(containerId)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          if (onScan) onScan(decodedText)
          stopScanning()
        },
        () => {}
      )
    } catch (err) {
      setScanning(false)
      if (onError) onError(err?.message || 'Error al acceder a la cámara')
    }
  }, [onScan, onError, stopScanning])

  return { scanning, startScanning, stopScanning, containerId }
}
