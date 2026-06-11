import { useState, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function useBarcodeScanner({ onScan, onError }) {
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)
  const containerId = 'barcode-scanner-container'

  const startScanning = useCallback(async () => {
    setScanning(true)
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
          if (onScan) {
            onScan(decodedText)
          }
          stopScanning()
        },
        () => {}
      )
    } catch (err) {
      setScanning(false)
      if (onError) {
        onError(err?.message || 'Error al acceder a la cámara')
      }
    }
  }, [onScan, onError])

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

  return { scanning, startScanning, stopScanning, containerId }
}
