# OSI - Organização de Solicitações Internas

Aplicação web desenvolvida como etapa de desafio técnico para organizar solicitações entre departamentos e tornar clara a ordem dos atendimentos.

## Escopo previsto

- Cadastrar solicitações com descrição, departamento solicitante, departamento responsável e prioridade, registrando automaticamente a data de entrada.
- Exibir a fila de cada departamento responsável e destacar a próxima solicitação.
- Alterar a prioridade de uma solicitação e reorganizar a fila.
- Concluir solicitações, retirando-as da fila ativa.

## Tecnologias escolhidas

- Frontend com React, TypeScript e Vite, com testes usando Vitest.
- Backend com Java 25 e Spring Boot, expondo uma API REST.
- Banco de dados PostgreSQL, com evolução do esquema por migrations.
- O ambiente local utilizará Docker e Docker Compose, mas no futuro a hospedagem planejada utilizará Render para o frontend e API, e Neon para o banco de dados.

## Estado do projeto

- **Concluído:** escopo, tecnologias e [regras da fila de atendimento](docs/regras-da-fila.md) definidos.
- **Próximo passo:** registrar as decisões de arquitetura e preparar a estrutura inicial do frontend e do backend.
- **Funcionalidades e publicação:** implementação e hospedagem ainda pendentes.
