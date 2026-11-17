# Regras da fila de atendimento

- Cada departamento responsável tem uma fila com suas solicitações ainda não concluídas. 
- O primeiro item da fila aparece em destaque como o próximo a ser atendido. 
- Se a fila estiver vazia, não há próxima solicitação.

## Ordem de atendimento

A fila segue estes critérios, na ordem:

1. **Prioridade atual:** urgente, alta, média e baixa.
2. **Data e hora de entrada:** entre solicitações de mesma prioridade, a mais antiga vem primeiro. A data e a hora seram registradas automaticamente durante o cadastro.
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
