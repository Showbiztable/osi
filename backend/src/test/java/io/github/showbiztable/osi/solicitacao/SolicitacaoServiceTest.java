package io.github.showbiztable.osi.solicitacao;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Tag("integration")
@SpringBootTest
@Transactional
class SolicitacaoServiceTest {

	private final SolicitacaoService service;
	private final JdbcClient jdbcClient;

	@Autowired
	SolicitacaoServiceTest(SolicitacaoService service, JdbcClient jdbcClient) {
		this.service = service;
		this.jdbcClient = jdbcClient;
	}

	@Test
	void cadastra_A_Solicitacao_E_Devolve_O_Id_Gerado() {
		// Given
		String descricao = "O sistema de notas fiscais não abre.";
		long solicitanteId = buscarIdDepartamento("Financeiro");
		long responsavelId = buscarIdDepartamento("TI");

		// When
		Long id = service.cadastrar(descricao, solicitanteId, responsavelId, Prioridade.ALTA);

		// Then
		assertNotNull(id, "O cadastro deve devolver o ID da solicitação gravada");
		String descricaoGravada = jdbcClient.sql("SELECT descricao FROM solicitacao WHERE id = :id")
			.param("id", id)
			.query(String.class)
			.optional()
			.orElse(null);
		assertEquals(descricao, descricaoGravada);
	}

	@Test
	@Transactional(propagation = Propagation.NOT_SUPPORTED)
	void grava_A_Nova_Prioridade_E_Atualiza_A_Ordem_Da_Fila() {
		// Given
		long solicitanteId = buscarIdDepartamento("Financeiro");
		long responsavelId = inserirDepartamentoDaFila();

		try {
			Long menorPrioridadeId = service.cadastrar("Atualizar o cadastro", solicitanteId, responsavelId, Prioridade.BAIXA);
			Long maiorPrioridadeId = service.cadastrar("Restaurar o acesso", solicitanteId, responsavelId, Prioridade.ALTA);

			// When
			service.alterarPrioridade(menorPrioridadeId, Prioridade.URGENTE);

			// Then
			String prioridadeGravada = jdbcClient.sql("SELECT prioridade FROM solicitacao WHERE id = :id")
				.param("id", menorPrioridadeId)
				.query(String.class)
				.single();
			List<Long> fila = service.listarFila(responsavelId).stream()
				.map(solicitacao -> solicitacao.getId())
				.toList();
			assertAll(
				() -> assertEquals(Prioridade.URGENTE.name(), prioridadeGravada),
				() -> assertEquals(List.of(menorPrioridadeId, maiorPrioridadeId), fila)
			);
		} finally {
			removerDepartamentoDaFila(responsavelId);
		}
	}

	@Test
	@Transactional(propagation = Propagation.NOT_SUPPORTED)
	void grava_A_Conclusao_E_Retira_A_Solicitacao_Da_Fila_Ativa() {
		// Given
		long solicitanteId = buscarIdDepartamento("Financeiro");
		long responsavelId = inserirDepartamentoDaFila();

		try {
			Long primeiraId = service.cadastrar("Restaurar o acesso", solicitanteId, responsavelId, Prioridade.URGENTE);
			Long seguinteId = service.cadastrar("Atualizar o cadastro", solicitanteId, responsavelId, Prioridade.ALTA);

			// When
			service.concluir(primeiraId);

			// Then
			Boolean ativa = jdbcClient.sql("SELECT ativa FROM solicitacao WHERE id = :id")
				.param("id", primeiraId)
				.query(Boolean.class)
				.optional()
				.orElse(null);
			List<Long> fila = service.listarFila(responsavelId).stream()
				.map(solicitacao -> solicitacao.getId())
				.toList();
			assertAll(
				() -> assertEquals(Boolean.FALSE, ativa, "A solicitação deve permanecer no banco como inativa"),
				() -> assertEquals(List.of(seguinteId), fila)
			);
		} finally {
			removerDepartamentoDaFila(responsavelId);
		}
	}

	private long inserirDepartamentoDaFila() {
		return jdbcClient.sql("INSERT INTO departamento (nome) VALUES (:nome) RETURNING id")
			.param("nome", "Departamento de teste da fila " + UUID.randomUUID())
			.query(Long.class)
			.single();
	}

	private void removerDepartamentoDaFila(long departamentoId) {
		jdbcClient.sql("DELETE FROM solicitacao WHERE departamento_responsavel_id = :id")
			.param("id", departamentoId)
			.update();
		jdbcClient.sql("DELETE FROM departamento WHERE id = :id")
			.param("id", departamentoId)
			.update();
	}

	private long buscarIdDepartamento(String nome) {
		return jdbcClient.sql("SELECT id FROM departamento WHERE nome = :nome")
			.param("nome", nome)
			.query(Long.class)
			.single();
	}
}
