package io.github.showbiztable.osi.solicitacao;

import static io.github.showbiztable.osi.acesso.ConfiguracaoSessaoDemo.SESSAO_AUTENTICADA;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.NoSuchElementException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import io.github.showbiztable.osi.acesso.ConfiguracaoSessaoDemo;

@WebMvcTest(SolicitacaoController.class)
@Import(ConfiguracaoSessaoDemo.class)
class SolicitacaoControllerTest {

	private final MockMvc mvc;

	@MockitoBean
	private SolicitacaoService service;

	@Autowired
	SolicitacaoControllerTest(MockMvc mvc) {
		this.mvc = mvc;
	}

	@Test
	void rejeita_A_Consulta_Da_Fila_Sem_Sessao() throws Exception {
		// Given
		String departamentoResponsavelId = "20";

		// When & Then
		mvc.perform(get("/api/solicitacoes").param("departamentoResponsavelId", departamentoResponsavelId))
			.andExpect(status().isUnauthorized());
		verifyNoInteractions(service);
	}

	@Test
	void responde_Com_Created_E_O_Id_Da_Solicitacao() throws Exception {
		// Given
		when(service.cadastrar("Acesso ao sistema de notas fiscais", 10L, 20L, Prioridade.ALTA))
			.thenReturn(42L);

		// When & Then
		mvc.perform(post("/api/solicitacoes")
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
						"descricao": "Acesso ao sistema de notas fiscais",
						"departamentoSolicitanteId": 10,
						"departamentoResponsavelId": 20,
						"prioridade": "ALTA"
					}
					"""))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.id").value(42));
	}

	@Test
	void responde_Com_Bad_Request_Quando_A_Prioridade_Nao_E_Informada() throws Exception {
		// Given
		long solicitacaoId = 42L;

		// When & Then
		mvc.perform(patch("/api/solicitacoes/{id}/prioridade", solicitacaoId)
				.sessionAttr(SESSAO_AUTENTICADA, true)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
			.andExpect(status().isBadRequest());
	}

	@Test
	void responde_Com_Not_Found_Quando_A_Solicitacao_Nao_Existe() throws Exception {
		// Given
		long solicitacaoId = 42L;
		doThrow(new NoSuchElementException()).when(service).alterarPrioridade(solicitacaoId, Prioridade.URGENTE);

		// When
		ResultActions resposta = assertDoesNotThrow(() -> mvc.perform(patch("/api/solicitacoes/{id}/prioridade", solicitacaoId)
			.sessionAttr(SESSAO_AUTENTICADA, true)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"prioridade": "URGENTE"}
				""")));

		// Then
		resposta.andExpect(status().isNotFound());
	}

	@Test
	void responde_Com_Not_Found_Ao_Concluir_Uma_Solicitacao_Inexistente() throws Exception {
		// Given
		long solicitacaoId = 42L;
		doThrow(new NoSuchElementException()).when(service).concluir(solicitacaoId);

		// When
		ResultActions resposta = assertDoesNotThrow(
			() -> mvc.perform(patch("/api/solicitacoes/{id}/conclusao", solicitacaoId)
				.sessionAttr(SESSAO_AUTENTICADA, true))
		);

		// Then
		resposta.andExpect(status().isNotFound());
	}
}
