package io.github.showbiztable.osi.solicitacao;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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
}
