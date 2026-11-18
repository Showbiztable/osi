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
