import * as XLSX from 'xlsx'

export function exportInventory(productos, conteo, ubicaciones = {}, conteoPosiciones = {}) {
  const data = []

  productos.forEach((p) => {
    const fisico = conteo[p.id] ?? ''
    const teorico = p.stock ?? ''
    const diff = teorico !== '' && fisico !== '' ? teorico - fisico : ''
    const posiciones = conteoPosiciones[p.id]

    if (posiciones && Object.keys(posiciones).length > 0) {
      Object.entries(posiciones).forEach(([pk, qty]) => {
        const [pas, pos] = pk.split('|')
        data.push({
          SKU: p.id,
          Nombre: p.nombre,
          Familia: p.familia,
          'Stock Teórico': teorico,
          'Cantidad Física': fisico,
          Diferencia: diff,
          Pasillo: pas || '',
          Posición: pos || '',
          Cantidad: qty,
        })
      })
    } else {
      data.push({
        SKU: p.id,
        Nombre: p.nombre,
        Familia: p.familia,
        'Stock Teórico': teorico,
        'Cantidad Física': fisico,
        Diferencia: diff,
        Pasillo: '',
        Posición: '',
        Cantidad: '',
      })
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
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
  XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
