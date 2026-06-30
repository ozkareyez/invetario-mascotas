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

-- =============================================================
-- RPC: Merge atómico de conteo por posición
-- =============================================================
CREATE OR REPLACE FUNCTION update_conteo_posicion(
  p_room_id TEXT,
  p_sku TEXT,
  p_pos_key TEXT,
  p_cantidad INTEGER
) RETURNS void AS $$
DECLARE
  conteo_pos_actual JSONB;
  nuevas_conteo_pos JSONB;
  nuevo_total INTEGER;
BEGIN
  SELECT conteo_posiciones INTO conteo_pos_actual
  FROM inventarios WHERE id = p_room_id FOR UPDATE;

  IF conteo_pos_actual IS NULL THEN
    conteo_pos_actual := '{}'::jsonb;
  END IF;

  nuevas_conteo_pos := jsonb_set(
    conteo_pos_actual,
    ARRAY[p_sku, p_pos_key],
    to_jsonb(p_cantidad),
    true
  );

  SELECT COALESCE(SUM((value)::int), 0)
  INTO nuevo_total
  FROM jsonb_each(nuevas_conteo_pos -> p_sku);

  UPDATE inventarios
  SET
    conteo = jsonb_set(
      COALESCE(conteo, '{}'::jsonb),
      ARRAY[p_sku],
      to_jsonb(nuevo_total),
      true
    ),
    conteo_posiciones = nuevas_conteo_pos
  WHERE id = p_room_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_conteo_posicion TO anon;

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
