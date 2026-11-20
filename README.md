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
- O PostgreSQL local roda com Docker Compose. Na demo, o Render hospeda o frontend estático e a API em Docker, com PostgreSQL no Neon.

## Como rodar o projeto localmente

Você vai precisar de **JDK 25**, **Node.js 26 com npm** e **Docker com Compose**. Abra a raiz do repositório no VS Code e use terminais separados para a API e o frontend.

### PostgreSQL

Com o Docker em execução, suba o banco a partir da raiz do repositório.

```powershell
docker compose up -d --wait db
```

O PostgreSQL fica acessível em `127.0.0.1:5432`.  
O banco e o usuário se chamam `osi`, e a senha `osi_local` serve para o desenvolvimento local.  
Na demo, a API recebe as credenciais do Neon por variáveis de ambiente.

### API

Em outro terminal, a partir da raiz, defina um código de acesso para o ambiente local e inicie a API. No PowerShell, use os comandos abaixo.

```powershell
$env:OSI_DEMO_CODIGO = 'osi-local'
.\backend\mvnw.cmd -B -ntp -f backend/pom.xml spring-boot:run
```

No Linux ou macOS, use o script `mvnw`.

```bash
OSI_DEMO_CODIGO=osi-local ./backend/mvnw -B -ntp -f backend/pom.xml spring-boot:run
```

A API roda em `http://localhost:8080` e o Flyway aplica as migrations ao iniciar.

### Frontend

Em outro terminal, a partir da raiz do repositório, instale as dependências travadas no `package-lock.json` e execute o Vite.

```sh
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173` e entre com o código local `osi-local`. O Vite encaminha as chamadas `/api` para o backend.

Use `Ctrl+C` nos terminais da API e do frontend para encerrá-los. Na raiz, use `docker compose stop db` para parar o banco. O volume `postgres-data` guarda os dados entre execuções.

## Testes do backend

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

## Ordem de atendimento

Cada departamento responsável tem uma fila de solicitações ativas. A ordem segue estes critérios.

1. **Prioridade atual** — urgente, alta, média e baixa, nessa ordem.
2. **Data e hora de entrada** — na mesma prioridade, a solicitação mais antiga vem primeiro.
3. **Identificador** — se a prioridade e o instante de entrada forem iguais, o menor ID vem primeiro para manter a ordem estável.

A fila destaca o primeiro item como a próxima solicitação. Alterar a prioridade reorganiza a fila preservando a data de entrada. Concluir retira o item da fila ativa. [Regras da fila e exemplo](docs/regras-da-fila.md)

## Estado do projeto

- **Concluído:** escopo, tecnologias, [regras da fila de atendimento](docs/regras-da-fila.md) e [arquitetura inicial](docs/arquitetura.md) definidos.
- **Estrutura inicial:** backend Spring Boot com Maven Wrapper e frontend React com Vite.
- **Verificações:** GitHub Actions executa os testes e o build dos dois projetos, além do lint do frontend.
- **Cadastro:** o formulário consulta os departamentos pela API, grava a solicitação no PostgreSQL e exibe o ID gerado.
- **Fila de atendimento:** a tela lista as solicitações ativas do departamento escolhido na ordem de atendimento e destaca a próxima.
- **Alteração de prioridade:** a tela permite mudar a prioridade de uma solicitação e atualiza a fila após a confirmação da API.
- **Conclusão de solicitações** pelo botão da fila. A solicitação permanece registrada e sai da fila ativa.
- **Banco de dados:** PostgreSQL local com Docker Compose e migrations do Flyway para departamentos e solicitações.
- **Publicação:** [Demo da OSI](https://osi-demo.onrender.com/) com acesso por código. Use **Verificar conexão** na tela de acesso se a API estiver em pausa.
