-- =============================================================
-- Supabase Schema para Inventario Multi-dispositivo
-- =============================================================

DROP TRIGGER IF EXISTS trg_inventarios_actualizado ON inventarios;
DROP TRIGGER IF EXISTS trg_inventarios_updated_at ON inventarios;
DROP FUNCTION IF EXISTS update_actualizado_en();
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS update_conteo_posicion(TEXT, TEXT, TEXT, INTEGER);

CREATE TABLE IF NOT EXISTS inventarios (
  id                TEXT PRIMARY KEY,
  productos         JSONB NOT NULL DEFAULT '[]',
  conteo            JSONB NOT NULL DEFAULT '{}',
  conteo_posiciones JSONB NOT NULL DEFAULT '{}',
  ubicaciones       JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventarios_id ON inventarios (id);

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

DROP POLICY IF EXISTS "Permitir eliminación pública" ON inventarios;
CREATE POLICY "Permitir eliminación pública"
  ON inventarios FOR DELETE
  USING (true);
