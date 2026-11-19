CREATE TABLE departamento (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE
);

INSERT INTO departamento (nome) VALUES ('Financeiro'), ('TI');
