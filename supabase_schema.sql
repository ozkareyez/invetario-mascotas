-- =============================================================
-- Supabase Schema para Inventario Multi-dispositivo
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- Tabla principal: una fila por sala (room)
-- Cada sala contiene el catálogo y todos los conteos en JSONB
CREATE TABLE IF NOT EXISTS inventarios (
  id            TEXT PRIMARY KEY,              -- Código de sala (ej: ABC123)
  productos     JSONB NOT NULL DEFAULT '[]',   -- Catálogo de productos
  conteo        JSONB NOT NULL DEFAULT '{}',   -- { sku: total }
  conteo_posiciones JSONB NOT NULL DEFAULT '{}', -- { sku: { "pasillo|pos": cantidad } }
  ubicaciones   JSONB NOT NULL DEFAULT '{}',   -- { sku: [{ pasillo, posicion, stock }] }
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_inventarios_id ON inventarios (id);

-- =============================================================
-- Función para actualizar updated_at automáticamente
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para mantener updated_at al día
DROP TRIGGER IF EXISTS trg_inventarios_updated_at ON inventarios;
CREATE TRIGGER trg_inventarios_updated_at
  BEFORE UPDATE ON inventarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- Seguridad: permitir acceso público con código de sala
-- (ajustar según necesidades de seguridad)
-- =============================================================
ALTER TABLE inventarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública" ON inventarios;
CREATE POLICY "Permitir lectura pública"
  ON inventarios FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública" ON inventarios;
CREATE POLICY "Permitir inserción pública"
  ON inventarios FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización pública" ON inventarios;
CREATE POLICY "Permitir actualización pública"
  ON inventarios FOR UPDATE
  USING (true);

-- =============================================================
-- Habilitar Realtime para esta tabla
-- (desde Supabase Dashboard > Database > Replication)
-- O ejecutar:
-- =============================================================
-- Nota: En Supabase Dashboard, ir a:
--   Database > Replication > Enable replication for "inventarios"
-- Esto permite que los cambios se propaguen en tiempo real
