# Revisão técnica da OSI

## Frontend

O painel mantém um catálogo compartilhado entre formulário, filtro e tela de departamentos. Os botões e o arraste chamam as mesmas ações de conclusão e reabertura. As notificações usam `status` para confirmações e `alert` para erros. [Painel](../frontend/src/App.tsx), [quadro](../frontend/src/FilaAtendimento.tsx) e [notificação](../frontend/src/Notificacao.tsx).

1. **Preservar o foco após mover um cartão.** O quadro permanece visível durante a atualização. Ao mudar de coluna, o cartão é renderizado em outra lista e o botão anterior perde o foco. Direcionar o foco para o cartão movido ou para a coluna de destino ajuda quem usa teclado. [Painel](../frontend/src/App.tsx)
2. **Automatizar o fluxo no navegador.** Os testes atuais cobrem o cliente HTTP e a marcação dos componentes. Um teste de ponta a ponta pode verificar arraste, retorno à coluna de origem, foco e persistência com a API real. [Testes do quadro](../frontend/src/FilaAtendimento.test.tsx)
3. **Permitir recuperação por coluna.** A fila ativa e as concluídas são carregadas em paralelo com `Promise.all`. Se uma consulta falhar, hoje o painel pede para carregar as duas novamente. [Painel](../frontend/src/App.tsx)

## Backend

A mudança de estado fica na entidade e é persistida em transações do serviço. O repositório concentra a ordem de atendimento. A migration V3 garante a unicidade de nomes de departamentos sem distinção entre maiúsculas e minúsculas, inclusive quando os cadastros são simultâneos. [Serviço de solicitações](../backend/src/main/java/io/github/showbiztable/osi/solicitacao/SolicitacaoService.java), [repositório](../backend/src/main/java/io/github/showbiztable/osi/solicitacao/SolicitacaoRepository.java) e [migration V3](../backend/src/main/resources/db/migration/V3__garante_nomes_de_departamento_unicos.sql).

1. **Validar o cadastro de solicitações na API.** Validar a descrição e traduzir referências de departamento inválidas em respostas `4xx` com mensagens claras. Hoje o formulário ajuda a prevenir esses casos e as chaves estrangeiras protegem os dados. [Controlador de solicitações](../backend/src/main/java/io/github/showbiztable/osi/solicitacao/SolicitacaoController.java) e [schema de solicitações](../backend/src/main/resources/db/migration/V2__cria_solicitacoes.sql)
2. **Tornar explícita a ordem das concluídas se ela virar requisito.** A consulta usa o estado da solicitação. Uma ordem cronológica de conclusão também exigiria registrar o momento da conclusão. [Repositório de solicitações](../backend/src/main/java/io/github/showbiztable/osi/solicitacao/SolicitacaoRepository.java)

## Verificações do quadro

- Frontend com 45 testes, lint e build.
- Backend com 57 testes, incluindo integração com PostgreSQL 17 e Flyway.
- Conferência no navegador local com API simulada para arraste nos dois sentidos, leitura e edição da descrição de cartões ativos e concluídos, seleção e limpeza de filtros, cadastro de departamentos e notificações.
- Conferência da rolagem com a atualização da fila atrasada e com falha seguida de nova tentativa.
