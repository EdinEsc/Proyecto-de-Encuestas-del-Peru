-- Las elecciones creadas por el seed se insertaban sin slug (la migración 004
-- corre antes que el seed), por lo que el panel admin no podía generar su link
-- público. Rellenamos las que quedaron vacías.
UPDATE elections
SET slug = TRIM(BOTH '-' FROM LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRANSLATE(title, 'áéíóúñüÁÉÍÓÚÑÜ', 'aeiounuAEIOUNU'),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
))
WHERE slug IS NULL OR slug = '';
