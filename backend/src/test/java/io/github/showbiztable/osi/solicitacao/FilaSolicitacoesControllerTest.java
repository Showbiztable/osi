package io.github.showbiztable.osi.solicitacao;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Tag("integration")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FilaSolicitacoesControllerTest {

	private final MockMvc mvc;
	private final JdbcClient jdbcClient;
	private final SolicitacaoRepository repository;

	@Autowired
	FilaSolicitacoesControllerTest(MockMvc mvc, JdbcClient jdbcClient, SolicitacaoRepository repository) {
		this.mvc = mvc;
		this.jdbcClient = jdbcClient;
		this.repository = repository;
	}

	@Test
	void devolve_A_Fila_Do_Departamento_Na_Ordem_De_Atendimento() throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long responsavelId = inserirDepartamentoDaFila();
		Instant entrada = Instant.parse("2026-11-19T12:15:00Z");
		Clock relogio = Clock.fixed(entrada, ZoneOffset.UTC);
		Solicitacao baixa = repository.saveAndFlush(
			Solicitacao.cadastrar("Atualizar o cadastro", solicitanteId, responsavelId, Prioridade.BAIXA, relogio)
		);
		Solicitacao urgente = repository.saveAndFlush(
			Solicitacao.cadastrar("Restaurar o acesso", solicitanteId, responsavelId, Prioridade.URGENTE, relogio)
		);

		// When & Then
		mvc.perform(get("/api/solicitacoes").param("departamentoResponsavelId", responsavelId.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(2))
			.andExpect(jsonPath("$[0].id").value(is(urgente.getId()), Long.class))
			.andExpect(jsonPath("$[0].descricao").value("Restaurar o acesso"))
			.andExpect(jsonPath("$[0].departamentoSolicitanteId").value(is(solicitanteId), Long.class))
			.andExpect(jsonPath("$[0].prioridade").value("URGENTE"))
			.andExpect(jsonPath("$[0].entrada").value(entrada.toString()))
			.andExpect(jsonPath("$[1].id").value(is(baixa.getId()), Long.class));
	}

	@Test
	void altera_A_Prioridade_E_Devolve_A_Fila_Na_Nova_Ordem() throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long responsavelId = inserirDepartamentoDaFila();
		Instant entrada = Instant.parse("2026-11-19T12:15:00Z");
		Clock relogio = Clock.fixed(entrada, ZoneOffset.UTC);
		Solicitacao baixa = repository.saveAndFlush(
			Solicitacao.cadastrar("Atualizar o cadastro", solicitanteId, responsavelId, Prioridade.BAIXA, relogio)
		);
		Solicitacao alta = repository.saveAndFlush(
			Solicitacao.cadastrar("Restaurar o acesso", solicitanteId, responsavelId, Prioridade.ALTA, relogio)
		);

		// When & Then
		mvc.perform(patch("/api/solicitacoes/{id}/prioridade", baixa.getId())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"prioridade": "URGENTE"}
					"""))
			.andExpect(status().isNoContent());

		mvc.perform(get("/api/solicitacoes").param("departamentoResponsavelId", responsavelId.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].id").value(is(baixa.getId()), Long.class))
			.andExpect(jsonPath("$[0].prioridade").value("URGENTE"))
			.andExpect(jsonPath("$[0].entrada").value(entrada.toString()))
			.andExpect(jsonPath("$[1].id").value(is(alta.getId()), Long.class));
	}

	@Test
	void conclui_A_Primeira_Solicitacao_E_Devolve_A_Fila_Ativa() throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long responsavelId = inserirDepartamentoDaFila();
		Clock relogio = Clock.fixed(Instant.parse("2026-11-19T12:15:00Z"), ZoneOffset.UTC);
		Solicitacao primeira = repository.saveAndFlush(
			Solicitacao.cadastrar("Restaurar o acesso", solicitanteId, responsavelId, Prioridade.URGENTE, relogio)
		);
		Solicitacao seguinte = repository.saveAndFlush(
			Solicitacao.cadastrar("Atualizar o cadastro", solicitanteId, responsavelId, Prioridade.ALTA, relogio)
		);

		// When & Then
		mvc.perform(patch("/api/solicitacoes/{id}/conclusao", primeira.getId()))
			.andExpect(status().isNoContent());

		mvc.perform(get("/api/solicitacoes").param("departamentoResponsavelId", responsavelId.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].id").value(is(seguinte.getId()), Long.class));
	}

	private Long buscarIdDoFinanceiro() {
		return jdbcClient.sql("SELECT id FROM departamento WHERE nome = 'Financeiro'")
			.query(Long.class)
			.single();
	}

	private Long inserirDepartamentoDaFila() {
		return jdbcClient.sql("INSERT INTO departamento (nome) VALUES (:nome) RETURNING id")
			.param("nome", "Departamento da fila " + UUID.randomUUID())
			.query(Long.class)
			.single();
	}
}
