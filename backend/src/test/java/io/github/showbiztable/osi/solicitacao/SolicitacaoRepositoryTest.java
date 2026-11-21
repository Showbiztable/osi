package io.github.showbiztable.osi.solicitacao;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

@Tag("integration")
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

	@Test
	void lista_A_Fila_Ativa_Do_Departamento_Na_Ordem_De_Atendimento() {
		// Given
		String identificadorTeste = UUID.randomUUID().toString();
		long departamentoId = inserirDepartamento("Responsável " + identificadorTeste);
		long outroDepartamentoId = inserirDepartamento("Outro " + identificadorTeste);
		OffsetDateTime entradaAntiga = OffsetDateTime.parse("2026-11-18T09:00:00Z");
		OffsetDateTime entradaRecente = entradaAntiga.plusMinutes(15);

		long baixa = inserirSolicitacao(outroDepartamentoId, departamentoId, Prioridade.BAIXA, entradaAntiga, true);
		long media = inserirSolicitacao(outroDepartamentoId, departamentoId, Prioridade.MEDIA, entradaAntiga, true);
		long altaRecente = inserirSolicitacao(outroDepartamentoId, departamentoId, Prioridade.ALTA, entradaRecente, true);
		long primeiraAltaAntiga = inserirSolicitacao(
			outroDepartamentoId, departamentoId, Prioridade.ALTA, entradaAntiga, true
		);
		long segundaAltaAntiga = inserirSolicitacao(
			outroDepartamentoId, departamentoId, Prioridade.ALTA, entradaAntiga, true
		);
		long urgente = inserirSolicitacao(outroDepartamentoId, departamentoId, Prioridade.URGENTE, entradaRecente, true);
		inserirSolicitacao(departamentoId, outroDepartamentoId, Prioridade.URGENTE, entradaAntiga, true);
		inserirSolicitacao(outroDepartamentoId, departamentoId, Prioridade.URGENTE, entradaAntiga, false);

		// When
		List<Long> fila = repository.listarFilaAtivaPorDepartamentoResponsavel(departamentoId)
			.stream()
			.map(solicitacao -> solicitacao.getId())
			.toList();

		// Then
		assertEquals(List.of(urgente, primeiraAltaAntiga, segundaAltaAntiga, altaRecente, media, baixa), fila);
	}

	@Test
	void lista_A_Fila_Ativa_De_Todos_Os_Departamentos_Na_Ordem_De_Atendimento() {
		// Given
		String identificadorTeste = UUID.randomUUID().toString();
		long primeiroDepartamentoId = inserirDepartamento("Primeiro " + identificadorTeste);
		long segundoDepartamentoId = inserirDepartamento("Segundo " + identificadorTeste);
		OffsetDateTime entradaAntiga = OffsetDateTime.parse("2026-11-18T09:00:00Z");
		OffsetDateTime entradaRecente = entradaAntiga.plusMinutes(15);

		long altaRecente = inserirSolicitacao(
			primeiroDepartamentoId, segundoDepartamentoId, Prioridade.ALTA, entradaRecente, true
		);
		long primeiraAltaAntiga = inserirSolicitacao(
			primeiroDepartamentoId, segundoDepartamentoId, Prioridade.ALTA, entradaAntiga, true
		);
		long segundaAltaAntiga = inserirSolicitacao(
			segundoDepartamentoId, primeiroDepartamentoId, Prioridade.ALTA, entradaAntiga, true
		);
		long urgenteRecente = inserirSolicitacao(
			segundoDepartamentoId, primeiroDepartamentoId, Prioridade.URGENTE, entradaRecente, true
		);
		inserirSolicitacao(primeiroDepartamentoId, segundoDepartamentoId, Prioridade.URGENTE, entradaAntiga, false);

		// When
		List<Long> fila = repository.listarFilaAtiva().stream()
			.filter(solicitacao -> solicitacao.getDepartamentoResponsavelId() == primeiroDepartamentoId
				|| solicitacao.getDepartamentoResponsavelId() == segundoDepartamentoId)
			.map(solicitacao -> solicitacao.getId())
			.toList();

		// Then
		assertEquals(List.of(urgenteRecente, primeiraAltaAntiga, segundaAltaAntiga, altaRecente), fila);
	}

	private long buscarIdDepartamento(String nome) {
		return jdbcClient.sql("SELECT id FROM departamento WHERE nome = :nome")
			.param("nome", nome)
			.query(Long.class)
			.single();
	}

	private long inserirDepartamento(String nome) {
		return jdbcClient.sql("INSERT INTO departamento (nome) VALUES (:nome) RETURNING id")
			.param("nome", nome)
			.query(Long.class)
			.single();
	}

	private long inserirSolicitacao(long solicitanteId, long responsavelId, Prioridade prioridade,
		OffsetDateTime entrada, boolean ativa) {
		return jdbcClient.sql("""
			INSERT INTO solicitacao (descricao, departamento_solicitante_id, departamento_responsavel_id,
				prioridade, entrada, ativa)
			VALUES ('Solicitação do teste da fila', :solicitanteId, :responsavelId, :prioridade, :entrada, :ativa)
			RETURNING id
			""")
			.param("solicitanteId", solicitanteId)
			.param("responsavelId", responsavelId)
			.param("prioridade", prioridade.name())
			.param("entrada", entrada)
			.param("ativa", ativa)
			.query(Long.class)
			.single();
	}
}
