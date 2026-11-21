package io.github.showbiztable.osi.solicitacao;

import static io.github.showbiztable.osi.acesso.ConfiguracaoSessaoDemo.SESSAO_AUTENTICADA;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
		mvc.perform(get("/api/solicitacoes")
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.param("departamentoResponsavelId", responsavelId.toString()))
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
	void devolve_A_Fila_Geral_Com_O_Departamento_Responsavel_De_Cada_Solicitacao() throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long primeiroResponsavelId = inserirDepartamentoDaFila();
		Long segundoResponsavelId = inserirDepartamentoDaFila();
		Clock relogio = Clock.fixed(Instant.parse("2026-11-19T12:15:00Z"), ZoneOffset.UTC);
		Solicitacao primeira = repository.saveAndFlush(
			Solicitacao.cadastrar("Restaurar o acesso", solicitanteId, primeiroResponsavelId, Prioridade.URGENTE, relogio)
		);
		Solicitacao segunda = repository.saveAndFlush(
			Solicitacao.cadastrar("Atualizar o cadastro", solicitanteId, segundoResponsavelId, Prioridade.ALTA, relogio)
		);
		String itemComResponsavel = "$[?(@.id == %d && @.departamentoResponsavelId == %d)]";

		// When & Then
		mvc.perform(get("/api/solicitacoes").sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isOk())
			.andExpect(jsonPath(itemComResponsavel.formatted(primeira.getId(), primeiroResponsavelId)).isNotEmpty())
			.andExpect(jsonPath(itemComResponsavel.formatted(segunda.getId(), segundoResponsavelId)).isNotEmpty());
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
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"prioridade": "URGENTE"}
					"""))
			.andExpect(status().isNoContent());

		mvc.perform(get("/api/solicitacoes")
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.param("departamentoResponsavelId", responsavelId.toString()))
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
		mvc.perform(patch("/api/solicitacoes/{id}/conclusao", primeira.getId())
				.sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isNoContent());

		mvc.perform(get("/api/solicitacoes")
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.param("departamentoResponsavelId", responsavelId.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].id").value(is(seguinte.getId()), Long.class));
	}

	@Test
	void devolve_As_Solicitacoes_Concluidas_Com_A_Prioridade_E_O_Responsavel() throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long responsavelId = inserirDepartamentoDaFila();
		Clock relogio = Clock.fixed(Instant.parse("2026-11-19T12:15:00Z"), ZoneOffset.UTC);
		Solicitacao concluida = Solicitacao.cadastrar(
			"Restaurar o acesso", solicitanteId, responsavelId, Prioridade.ALTA, relogio
		);
		concluida.concluir();
		Long concluidaId = repository.saveAndFlush(concluida).getId();
		Long ativaId = repository.saveAndFlush(
			Solicitacao.cadastrar("Atualizar o cadastro", solicitanteId, responsavelId, Prioridade.ALTA, relogio)
		).getId();
		String itemComPrioridadeEResponsavel =
			"$[?(@.id == %d && @.departamentoResponsavelId == %d && @.prioridade == 'ALTA')]";

		// When & Then
		mvc.perform(get("/api/solicitacoes/concluidas").sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isOk())
			.andExpect(jsonPath(itemComPrioridadeEResponsavel.formatted(concluidaId, responsavelId)).isNotEmpty())
			.andExpect(jsonPath("$[?(@.id == %d)]".formatted(ativaId)).isEmpty());
	}

	@Test
	void devolve_A_Solicitacao_Reaberta_A_Fila_Em_Sua_Posicao_Original() throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long responsavelId = inserirDepartamentoDaFila();
		Instant entrada = Instant.parse("2026-11-19T12:15:00Z");
		Clock relogio = Clock.fixed(entrada, ZoneOffset.UTC);
		Solicitacao concluida = Solicitacao.cadastrar(
			"Restaurar o acesso", solicitanteId, responsavelId, Prioridade.ALTA, relogio
		);
		concluida.concluir();
		Long concluidaId = repository.saveAndFlush(concluida).getId();
		Long seguinteId = repository.saveAndFlush(Solicitacao.cadastrar(
			"Atualizar o cadastro", solicitanteId, responsavelId, Prioridade.ALTA,
			Clock.offset(relogio, Duration.ofMinutes(30))
		)).getId();

		// When
		mvc.perform(patch("/api/solicitacoes/{id}/reabertura", concluidaId)
				.sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isNoContent());
		mvc.perform(patch("/api/solicitacoes/{id}/reabertura", concluidaId)
				.sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isNoContent());

		// Then
		mvc.perform(get("/api/solicitacoes")
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.param("departamentoResponsavelId", responsavelId.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(2))
			.andExpect(jsonPath("$[0].id").value(is(concluidaId), Long.class))
			.andExpect(jsonPath("$[0].prioridade").value("ALTA"))
			.andExpect(jsonPath("$[0].entrada").value(entrada.toString()))
			.andExpect(jsonPath("$[1].id").value(is(seguinteId), Long.class));
		mvc.perform(get("/api/solicitacoes/concluidas").sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.id == %d)]".formatted(concluidaId)).isEmpty());
	}

	@Test
	void responde_Com_Not_Found_Ao_Reabrir_Uma_Solicitacao_Inexistente() throws Exception {
		// Given
		long idInexistente = Long.MAX_VALUE;

		// When & Then
		mvc.perform(patch("/api/solicitacoes/{id}/reabertura", idInexistente)
				.sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isNotFound());
	}

	@ParameterizedTest
	@ValueSource(booleans = {true, false})
	void persiste_A_Descricao_Editada_Preservando_Os_Demais_Campos(boolean ativa) throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long responsavelId = inserirDepartamentoDaFila();
		Instant entrada = Instant.parse("2026-11-19T12:15:00Z");
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Restaurar o acesso", solicitanteId, responsavelId, Prioridade.ALTA, Clock.fixed(entrada, ZoneOffset.UTC)
		);
		if (!ativa) {
			solicitacao.concluir();
		}
		Long solicitacaoId = repository.saveAndFlush(solicitacao).getId();

		// When
		mvc.perform(patch("/api/solicitacoes/{id}/descricao", solicitacaoId)
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"descricao": "  Restaurar o acesso ao portal  "}
					"""))
			.andExpect(status().isNoContent());
		repository.flush();

		// Then
		String consulta = ativa ? "/api/solicitacoes" : "/api/solicitacoes/concluidas";
		String itemPreservado = """
			$[?(@.id == %d && @.departamentoSolicitanteId == %d && @.departamentoResponsavelId == %d \
			&& @.prioridade == 'ALTA' && @.entrada == '%s' && @.descricao == 'Restaurar o acesso ao portal')]
			""".strip().formatted(solicitacaoId, solicitanteId, responsavelId, entrada);
		mvc.perform(get(consulta).sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isOk())
			.andExpect(jsonPath(itemPreservado).isNotEmpty());
	}

	@ParameterizedTest
	@ValueSource(strings = {"{}", "{\"descricao\":null}", "{\"descricao\":\" \\t \"}"})
	void rejeita_Uma_Edicao_De_Descricao_Sem_Texto(String corpo) throws Exception {
		// Given
		Long solicitanteId = buscarIdDoFinanceiro();
		Long responsavelId = inserirDepartamentoDaFila();
		Long solicitacaoId = repository.saveAndFlush(Solicitacao.cadastrar(
			"Restaurar o acesso", solicitanteId, responsavelId, Prioridade.ALTA, Clock.systemUTC()
		)).getId();

		// When & Then
		mvc.perform(patch("/api/solicitacoes/{id}/descricao", solicitacaoId)
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.contentType(MediaType.APPLICATION_JSON)
				.content(corpo))
			.andExpect(status().isBadRequest());
	}

	@Test
	void responde_Com_Not_Found_Ao_Editar_A_Descricao_De_Uma_Solicitacao_Inexistente() throws Exception {
		// Given
		long idInexistente = Long.MAX_VALUE;

		// When & Then
		mvc.perform(patch("/api/solicitacoes/{id}/descricao", idInexistente)
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"descricao": "Restaurar o acesso ao portal"}
					"""))
			.andExpect(status().isNotFound());
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
