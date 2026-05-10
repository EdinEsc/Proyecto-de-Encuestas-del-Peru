-- Migration: Add slug column to elections for unique voting links
ALTER TABLE elections ADD COLUMN IF NOT EXISTS slug VARCHAR(120) UNIQUE;

-- Generate slugs for existing elections based on title
UPDATE elections SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(title, 'á','a'), 'é','e'), 'í','i'), 'ó','o'), 'ú','u'), 'ñ','n'), 'ü','u'),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
) WHERE slug IS NULL;

-- Add delete capability for regions
-- (regions can already be deleted via CASCADE, but we add explicit support)
