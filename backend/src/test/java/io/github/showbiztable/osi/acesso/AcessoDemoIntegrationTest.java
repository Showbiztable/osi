package io.github.showbiztable.osi.acesso;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@Tag("integration")
@SpringBootTest(properties = "osi.demo.codigo=" + AcessoDemoIntegrationTest.CODIGO_DE_TESTE)
@AutoConfigureMockMvc
class AcessoDemoIntegrationTest {

	static final String CODIGO_DE_TESTE = "codigo-ficticio-da-demo";
	private final MockMvc mvc;
	private final JdbcClient jdbcClient;

	@Autowired
	AcessoDemoIntegrationTest(MockMvc mvc, JdbcClient jdbcClient) {
		this.mvc = mvc;
		this.jdbcClient = jdbcClient;
	}

	@Test
	void abre_Uma_Sessao_Com_Codigo_Valido_E_Libera_A_Consulta_Da_Fila() throws Exception {
		// Given
		Long departamentoId = jdbcClient.sql("SELECT id FROM departamento WHERE nome = 'TI'")
			.query(Long.class)
			.single();

		// When
		MvcResult acesso = mvc.perform(post("/api/acesso")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"codigo": "%s"}
					""".formatted(CODIGO_DE_TESTE)))
			.andExpect(status().isNoContent())
			.andReturn();

		// Then
		MockHttpSession sessao = assertInstanceOf(MockHttpSession.class, acesso.getRequest().getSession(false));
		mvc.perform(get("/api/solicitacoes")
				.session(sessao)
				.param("departamentoResponsavelId", departamentoId.toString()))
			.andExpect(status().isOk());
	}
}
