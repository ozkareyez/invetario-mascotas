import * as XLSX from 'xlsx'
import { EXCEL_COLUMNS } from '../constants'

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (!rows.length) {
          reject(new Error('El archivo Excel está vacío'))
          return
        }

        const header = Object.keys(rows[0]).map((k) => k.toLowerCase().trim())
        const hasSku = header.includes(EXCEL_COLUMNS.SKU)
        const hasDesc = header.includes(EXCEL_COLUMNS.DESCRIPCION)
        const hasCat = header.includes(EXCEL_COLUMNS.CATEGORIA)
        const hasStock = header.includes(EXCEL_COLUMNS.STOCK)

        if (!hasSku || !hasDesc) {
          reject(
            new Error(
              'El Excel debe tener las columnas: sku, descripcion, categoria'
            )
          )
          return
        }

        const productos = rows.map((row, i) => {
          const keys = Object.keys(row)
          const getVal = (key) => {
            const match = keys.find(
              (k) => k.toLowerCase().trim() === key
            )
            return match ? String(row[match]).trim() : ''
          }
          const stockVal = hasStock ? getVal(EXCEL_COLUMNS.STOCK) : ''
          return {
            id: getVal(EXCEL_COLUMNS.SKU),
            nombre: getVal(EXCEL_COLUMNS.DESCRIPCION),
            familia: hasCat ? getVal(EXCEL_COLUMNS.CATEGORIA) : 'General',
            stock: stockVal ? parseFloat(stockVal) || 0 : null,
          }
        }).filter((p) => p.id && p.nombre)

        if (!productos.length) {
          reject(new Error('No se encontraron productos válidos en el Excel'))
          return
        }

        resolve(productos)
      } catch (err) {
        reject(new Error('Error al leer el archivo: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}
