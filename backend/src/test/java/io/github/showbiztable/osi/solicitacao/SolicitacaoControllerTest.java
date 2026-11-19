package io.github.showbiztable.osi.solicitacao;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.NoSuchElementException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@WebMvcTest(SolicitacaoController.class)
class SolicitacaoControllerTest {

	private final MockMvc mvc;

	@MockitoBean
	private SolicitacaoService service;

	@Autowired
	SolicitacaoControllerTest(MockMvc mvc) {
		this.mvc = mvc;
	}

	@Test
	void responde_Com_Created_E_O_Id_Da_Solicitacao() throws Exception {
		// Given
		when(service.cadastrar("Acesso ao sistema de notas fiscais", 10L, 20L, Prioridade.ALTA))
			.thenReturn(42L);

		// When & Then
		mvc.perform(post("/api/solicitacoes")
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
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"prioridade": "URGENTE"}
				""")));

		// Then
		resposta.andExpect(status().isNotFound());
	}
}
