import Fuse from 'fuse.js'

export function createSearcher(productos) {
  return new Fuse(productos, {
    keys: [
      { name: 'id', weight: 0.5 },
      { name: 'nombre', weight: 0.3 },
      { name: 'familia', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 1,
  })
}

export function searchProducts(searcher, query, familiaFilter) {
  if (!query.trim()) {
    return []
  }
  let results = searcher.search(query).map((r) => r.item)
  if (familiaFilter) {
    results = results.filter((p) => p.familia === familiaFilter)
  }
  return results
}
