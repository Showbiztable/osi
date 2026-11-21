package io.github.showbiztable.osi.solicitacao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

	String SOLICITACOES_ATIVAS = """
		SELECT s.*
		FROM solicitacao s
		WHERE s.ativa
		""";

	String ORDEM_DE_ATENDIMENTO = """
		ORDER BY CASE s.prioridade
			WHEN 'URGENTE' THEN 1
			WHEN 'ALTA' THEN 2
			WHEN 'MEDIA' THEN 3
			WHEN 'BAIXA' THEN 4
		END, s.entrada ASC, s.id ASC
		""";

	@Query(value = SOLICITACOES_ATIVAS + " AND s.departamento_responsavel_id = :departamentoId\n"
		+ ORDEM_DE_ATENDIMENTO, nativeQuery = true)
	List<Solicitacao> listarFilaAtivaPorDepartamentoResponsavel(@Param("departamentoId") long departamentoId);

	@Query(value = SOLICITACOES_ATIVAS + ORDEM_DE_ATENDIMENTO, nativeQuery = true)
	List<Solicitacao> listarFilaAtiva();

	@Query("SELECT s FROM Solicitacao s WHERE s.ativa = false")
	List<Solicitacao> listarConcluidas();
}
