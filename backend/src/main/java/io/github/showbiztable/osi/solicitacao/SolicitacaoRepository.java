package io.github.showbiztable.osi.solicitacao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

	@Query(value = """
		SELECT s.*
		FROM solicitacao s
		WHERE s.departamento_responsavel_id = :departamentoId
		  AND s.ativa
		ORDER BY CASE s.prioridade
			WHEN 'URGENTE' THEN 1
			WHEN 'ALTA' THEN 2
			WHEN 'MEDIA' THEN 3
			WHEN 'BAIXA' THEN 4
		END, s.entrada ASC, s.id ASC
		""", nativeQuery = true)
	List<Solicitacao> listarFilaAtivaPorDepartamentoResponsavel(@Param("departamentoId") long departamentoId);
}
