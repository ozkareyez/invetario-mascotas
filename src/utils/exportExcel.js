import * as XLSX from 'xlsx'

export function exportInventory(productos, conteo) {
  const data = productos.map((p) => {
    const fisico = conteo[p.id] ?? ''
    const teorico = p.stock ?? ''
    return {
      SKU: p.id,
      Nombre: p.nombre,
      Familia: p.familia,
      'Stock Teórico': teorico,
      'Cantidad Física': fisico,
      Diferencia: teorico !== '' && fisico !== '' ? teorico - fisico : '',
    }
  })

  const ws = XLSX.utils.json_to_sheet(data)

  const colWidths = [
    { wch: 14 },
    { wch: 50 },
    { wch: 25 },
    { wch: 14 },
    { wch: 16 },
    { wch: 12 },
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
  XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
