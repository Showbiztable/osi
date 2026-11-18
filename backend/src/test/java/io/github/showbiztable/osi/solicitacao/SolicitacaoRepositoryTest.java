package io.github.showbiztable.osi.solicitacao;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class SolicitacaoRepositoryTest {

	private final SolicitacaoRepository repository;
	private final JdbcClient jdbcClient;
	private final EntityManager entityManager;

	@Autowired
	SolicitacaoRepositoryTest(SolicitacaoRepository repository, JdbcClient jdbcClient, EntityManager entityManager) {
		this.repository = repository;
		this.jdbcClient = jdbcClient;
		this.entityManager = entityManager;
	}

	@Test
	void grava_E_Recupera_A_Solicitacao_Pelo_Id() {
		// Given
		String descricao = "Acesso ao sistema de notas fiscais";
		long solicitanteId = buscarIdDepartamento("Financeiro");
		long responsavelId = buscarIdDepartamento("TI");
		Instant entrada = Instant.parse("2026-11-18T12:15:00Z");
		Solicitacao solicitacao = Solicitacao.cadastrar(
			descricao, solicitanteId, responsavelId, Prioridade.ALTA, Clock.fixed(entrada, ZoneOffset.UTC)
		);

		// When
		Long id = repository.saveAndFlush(solicitacao).getId();
		entityManager.clear();

		// Then
		assertNotNull(id, "O banco deve gerar o ID da solicitação");
		Solicitacao recuperada = repository.findById(id).orElse(null);
		assertNotNull(recuperada, "A solicitação gravada deve ser encontrada pelo ID");
		assertAll(
			() -> assertEquals(id, recuperada.getId()),
			() -> assertEquals(descricao, recuperada.getDescricao()),
			() -> assertEquals(solicitanteId, recuperada.getDepartamentoSolicitanteId()),
			() -> assertEquals(responsavelId, recuperada.getDepartamentoResponsavelId()),
			() -> assertEquals(Prioridade.ALTA, recuperada.getPrioridade()),
			() -> assertEquals(entrada, recuperada.getEntrada()),
			() -> assertTrue(recuperada.isAtiva())
		);
	}

	private long buscarIdDepartamento(String nome) {
		return jdbcClient.sql("SELECT id FROM departamento WHERE nome = :nome")
			.param("nome", nome)
			.query(Long.class)
			.single();
	}
}
