-- Opción "No sabe / No opina": es un candidato más (foto, descripción, botón),
-- pero nunca compite por el liderazgo. La bandera permite anclarlo al final del
-- ranking sin importar cuántos votos acumule.
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_undecided BOOLEAN NOT NULL DEFAULT false;

-- Consultas de resultados y de listado ordenan primero por esta bandera.
CREATE INDEX IF NOT EXISTS idx_candidates_election_undecided
ON candidates (election_id, is_undecided);
