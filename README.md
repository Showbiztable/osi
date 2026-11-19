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

## Banco de dados local

Com o Docker em execução, rode na raiz do repositório:

```powershell
docker compose up -d --wait db
```

O PostgreSQL fica acessível em `127.0.0.1:5432`.  
O banco e o usuário se chamam `osi`, e a senha `osi_local` serve para o desenvolvimento local.  
Na hospedagem, a API receberá as credenciais do Neon por variáveis de ambiente.

Com o banco em execução, valide o backend a partir da raiz do repositório.  
O teste de inicialização do Spring aplica as migrations do Flyway no PostgreSQL local.

```powershell
.\backend\mvnw.cmd -B -ntp -f backend/pom.xml verify
```

Os testes de integração têm a tag `integration`.  
Execute apenas os unitários sem precisar subir o PostgreSQL ou filtre apenas os testes de integração com o banco de dados em execução.

```powershell
# Apenas unitários
.\backend\mvnw.cmd -B -ntp -f backend/pom.xml "-DexcludedGroups=integration" test

# Apenas integração
.\backend\mvnw.cmd -B -ntp -f backend/pom.xml "-Dgroups=integration" test
```

Use `docker compose stop db` para parar o banco.  
O volume `postgres-data` guarda os dados entre execuções.

## Estado do projeto

- **Concluído:** escopo, tecnologias, [regras da fila de atendimento](docs/regras-da-fila.md) e [arquitetura inicial](docs/arquitetura.md) definidos.
- **Estrutura inicial:** backend Spring Boot com Maven Wrapper e frontend React com Vite.
- **Verificações:** GitHub Actions executa os testes e o build dos dois projetos, além do lint do frontend.
- **Cadastro:** o formulário consulta os departamentos pela API, grava a solicitação no PostgreSQL e exibe o ID gerado.
- **Fila de atendimento:** a tela lista as solicitações ativas do departamento escolhido na ordem de atendimento e destaca a próxima.
- **Banco de dados:** PostgreSQL local com Docker Compose e migrations do Flyway para departamentos e solicitações.
- **Próximo passo:** permitir mudar a prioridade de uma solicitação e atualizar a fila.
- **Publicação:** hospedagem pendente.
