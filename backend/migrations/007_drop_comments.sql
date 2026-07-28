-- Se retira la función de opiniones: el cliente ya no la quiere en el producto.
-- En instalaciones nuevas la tabla ya no se crea (001_init.sql); esta migración
-- la elimina en las bases que ya existen, junto con las opiniones guardadas.
DROP INDEX IF EXISTS idx_comments_candidate_created;
DROP TABLE IF EXISTS comments;
