# Regras da fila de atendimento

- Cada departamento responsável tem uma fila com suas solicitações ainda não concluídas. 
- O primeiro item da fila aparece em destaque como o próximo a ser atendido. 
- Se a fila estiver vazia, não há próxima solicitação.

## Cadastro de uma solicitação

Quem cadastra a solicitação informa a descrição, o departamento solicitante, o departamento responsável pelo atendimento e a prioridade (baixa, média, alta ou urgente).  
O sistema registra a data e a hora do cadastro como entrada.  
A solicitação entra na fila ativa do departamento responsável com a prioridade informada.

Por exemplo, em 18/11/2026 às 09:15, o Financeiro solicita à TI acesso ao sistema de notas fiscais e escolhe a prioridade alta.  
A solicitação entra na fila da TI com prioridade alta e entrada em 18/11/2026 às 09:15.  
O Financeiro aparece como departamento solicitante.

### Escolha dos departamentos

O formulário oferece dois seletores, um para o departamento solicitante e outro para o responsável.  
Ambos usam a mesma lista de departamentos, consultada pela API.  
Uma migration do banco cria os registros iniciais, incluindo Financeiro e TI.

O formulário envia o identificador de cada departamento escolhido.  
O sistema só registra a solicitação se os dois identificadores corresponderem a departamentos cadastrados.  
Usar uma lista única evita que variações de escrita, como «TI» e «T.I.», criem filas diferentes para o mesmo departamento.

## Ordem de atendimento

A fila segue estes critérios, na ordem:

1. **Prioridade atual:** urgente, alta, média e baixa.
2. **Data e hora de entrada:** entre solicitações de mesma prioridade, a mais antiga vem primeiro.
3. **Identificador:** se a prioridade e o tempo de entrada forem iguais, o menor identificador numérico vem primeiro para garantir uma ordem estável.

A prioridade permite atender casos urgentes primeiro.  
O desempate por entrada respeita o tempo de espera dentro da mesma prioridade.  
Se chegarem solicitações de prioridade maior continuamente, as de prioridade menor podem esperar mais.

## Mudanças na fila

- **Alterar a prioridade:** a solicitação muda de posição conforme a nova prioridade, preservando a data e a hora de entrada originais.
- **Concluir uma solicitação:** ela sai da fila ativa e permanece registrada como concluída. Se era a primeira da fila, a próxima da fila assume o destaque.
- **Reabrir uma solicitação:** ela volta à fila do mesmo departamento com o mesmo identificador, a prioridade registrada e a data de entrada original. A ordem de atendimento determina sua posição e qual solicitação fica em destaque. Repetir a reabertura de uma solicitação já ativa preserva seus dados e sua posição.
- **Editar a descrição:** qualquer solicitação, ativa ou concluída, pode ter a descrição atualizada pelo diálogo do cartão. O sistema remove espaços nas extremidades e rejeita texto ausente, nulo ou em branco. O cadastro mantém o identificador, os departamentos, a prioridade, a data de entrada e a situação que já tinha.

## Quadro de solicitações previsto

- O quadro abre com as solicitações de todos os departamentos responsáveis nas colunas **Ativas** e **Concluídas**. Cada cartão identifica o departamento solicitante e o responsável.
- O filtro permite selecionar um ou mais departamentos responsáveis e se aplica às duas colunas. Sem seleção, o quadro mostra todos os departamentos.
- A coluna **Ativas** usa a ordem de atendimento definida acima. A primeira solicitação ativa de cada departamento visível recebe o destaque de próxima, mesmo quando vários departamentos aparecem juntos.
- O botão **Concluir** e o arraste de um cartão ativo para **Concluídas** executam a mesma ação. Após a confirmação, o cartão muda de coluna e a próxima solicitação daquele departamento assume o destaque. O cartão concluído exibe a prioridade registrada.
- O formulário **Nova solicitação** fica disponível ao lado do quadro em telas largas. Um cadastro confirmado atualiza o quadro.
- A aba **Departamentos** lista os departamentos e permite cadastrar um nome. O cadastro remove espaços nas extremidades e rejeita nomes vazios e duplicatas que diferem apenas por maiúsculas e minúsculas. O novo departamento aparece nas opções do formulário e do filtro.

## Melhorias pendentes do quadro

- [x] Remover o atalho **Nova solicitação** do cabeçalho do quadro. O formulário já está visível na tela da fila.
- [x] Aumentar a legibilidade de **De** e **Para** nos cartões e dar mais destaque ao departamento responsável. A indicação de próxima solicitação deve deixar claro a qual departamento ela pertence.
- [x] Reorganizar o conteúdo dos cartões para destacar descrição, prioridade e departamentos. Manter o identificador e a data de entrada em segundo plano, com contraste suficiente para leitura.
- [x] Alinhar as ações no rodapé do cartão, com **Ver descrição completa** à esquerda de **Concluir** ou **Reabrir**.
- [x] Centralizar o botão **Cadastrar solicitação** no rodapé do formulário, ocupando a largura disponível em telas estreitas.
- [x] Exibir o sucesso ou erro do cadastro em uma notificação temporária no canto superior direito, fora do rodapé do formulário. O componente pode ser reutilizado em outras ações do painel.
- [x] Adicionar **Fila de atendimento** e **Departamentos** à navegação do topo. A tela de departamentos tem sua própria listagem e formulário de cadastro.
- [x] Centralizar o título da fila. Abrir as caixas de seleção ao lado do botão **Filtro** e exibir os nomes selecionados mesmo com as opções recolhidas. **Limpar filtros** restaura as duas colunas para todos os departamentos.
- [x] Adicionar um favicon da OSI para identificar a aplicação na aba do navegador.
- [x] Padronizar a altura dos cartões em cada coluna e limitar a prévia da descrição a três linhas.
- [x] Exibir o número à esquerda e a prioridade à direita na primeira linha do cartão. Mostrar o destaque de próxima solicitação e a data de entrada em linhas próprias. Usar o mesmo fundo para **De** e **Para**.
- [x] Exibir o rótulo **Prioridade** e o seletor na mesma linha, com opções nas cores das etiquetas em navegadores que permitem personalizar o seletor nativo.
- [x] Permitir arrastar cartões de **Ativas** para **Concluídas**, reaproveitando a ação do botão **Concluir**.
- [x] Permitir arrastar cartões de **Concluídas** para **Ativas** para reabrir a solicitação com a regra de ordenação acima. Oferecer também a ação **Reabrir** no cartão concluído.
- [x] Exibir **Ver descrição completa** em todos os cartões e identificar a data de entrada com **Aberto em**.
- [x] Usar o mesmo esquema de cores no seletor de prioridade dos cartões e do cadastro.
- [x] Permitir editar e salvar a descrição no diálogo, com o botão de edição à esquerda de **Fechar**.

## Revisão técnica antes da entrega

- [x] Revisar o frontend com foco em responsabilidades dos componentes, estado, acessibilidade e testes dos fluxos principais.
- [x] Revisar o backend com foco em responsabilidades das camadas, validação das regras de negócio, testes, migrations e configuração da API.
- [x] Registrar os achados e as prioridades. [Revisão técnica](revisao-tecnica.md)

## Exemplo

Estas solicitações foram cadastradas no mesmo dia.  
Todas estão ativas.

| ID | Departamento responsável | Entrada | Prioridade inicial |
| --- | --- | --- | --- |
| 10 | TI | 09:00 | Baixa |
| 11 | TI | 09:15 | Alta |
| 12 | TI | 09:15 | Alta |
| 13 | Financeiro | 09:20 | Urgente |

1. **Fila inicial de TI:** `#11 → #12 → #10`. A prioridade alta vem antes da baixa. Como `#11` e `#12` têm o mesmo instante de entrada, o menor ID vem primeiro.
2. **`#10` passa de baixa para alta:** `#10 → #11 → #12`. Agora todas têm a mesma prioridade, e `#10` passa à frente porque entrou mais cedo.
3. **`#10` é concluída:** `#11 → #12`. O registro de `#10` é preservado, e `#11` volta a ser a próxima de TI.

Em todas essas etapas, a fila do Financeiro contém apenas `#13`.
