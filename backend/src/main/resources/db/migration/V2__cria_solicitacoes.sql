CREATE TABLE solicitacao (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    descricao TEXT NOT NULL,
    departamento_solicitante_id BIGINT NOT NULL REFERENCES departamento (id),
    departamento_responsavel_id BIGINT NOT NULL REFERENCES departamento (id),
    prioridade TEXT NOT NULL,
    entrada TIMESTAMP WITH TIME ZONE NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT solicitacao_prioridade_valida CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE'))
);
