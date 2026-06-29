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
        const hasPasillo = header.includes(EXCEL_COLUMNS.PASILLO)
        const hasPosicion = header.includes(EXCEL_COLUMNS.POSICION)

        if (!hasSku || !hasDesc) {
          reject(
            new Error(
              'El Excel debe tener las columnas: sku, descripcion, categoria'
            )
          )
          return
        }

        const getVal = (row, key) => {
          const keys = Object.keys(row)
          const match = keys.find((k) => k.toLowerCase().trim() === key)
          return match ? String(row[match]).trim() : ''
        }

        const parsedRows = rows.map((row) => {
          const stockVal = hasStock ? getVal(row, EXCEL_COLUMNS.STOCK) : ''
          return {
            id: getVal(row, EXCEL_COLUMNS.SKU),
            nombre: getVal(row, EXCEL_COLUMNS.DESCRIPCION),
            familia: hasCat ? getVal(row, EXCEL_COLUMNS.CATEGORIA) : 'General',
            stock: stockVal ? parseFloat(stockVal) || 0 : null,
            pasillo: hasPasillo ? getVal(row, EXCEL_COLUMNS.PASILLO) : '',
            posicion: hasPosicion ? getVal(row, EXCEL_COLUMNS.POSICION) : '',
          }
        }).filter((p) => p.id && p.nombre)

        if (!parsedRows.length) {
          reject(new Error('No se encontraron productos válidos en el Excel'))
          return
        }

        const seen = {}
        const ubicaciones = {}
        const productos = []

        parsedRows.forEach((row) => {
          if (row.pasillo || row.posicion) {
            if (!ubicaciones[row.id]) ubicaciones[row.id] = []
            ubicaciones[row.id].push({
              pasillo: row.pasillo,
              posicion: row.posicion,
              stock: row.stock,
            })
          }

          if (!seen[row.id]) {
            seen[row.id] = true
            productos.push({
              id: row.id,
              nombre: row.nombre,
              familia: row.familia,
              stock: row.stock,
            })
          } else {
            const existing = productos.find((p) => p.id === row.id)
            if (existing && existing.stock !== null && row.stock !== null) {
              existing.stock += row.stock
            }
          }
        })

        resolve({ productos, ubicaciones })
      } catch (err) {
        reject(new Error('Error al leer el archivo: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}
