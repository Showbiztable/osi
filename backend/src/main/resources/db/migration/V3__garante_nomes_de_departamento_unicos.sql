CREATE UNIQUE INDEX departamento_nome_normalizado_uidx ON departamento (lower(nome));

ALTER TABLE departamento DROP CONSTRAINT departamento_nome_key;
