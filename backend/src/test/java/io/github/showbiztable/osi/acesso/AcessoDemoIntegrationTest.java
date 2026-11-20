package io.github.showbiztable.osi.acesso;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

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
	void informa_A_Disponibilidade_Da_Api_Sem_Abrir_Sessao() throws Exception {
		// When & Then
		mvc.perform(get("/api/saude"))
			.andExpect(status().isNoContent())
			.andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
			.andExpect(resultado -> assertNull(resultado.getRequest().getSession(false)));
	}

	@Test
	void abre_Uma_Sessao_Com_Codigo_Valido_E_Libera_A_Consulta_Da_Fila() throws Exception {
		// Given
		Long departamentoId = jdbcClient.sql("SELECT id FROM departamento WHERE nome = 'TI'")
			.query(Long.class)
			.single();

		// When
		MockHttpSession sessao = abrirSessaoComCodigoValido();

		// Then
		mvc.perform(get("/api/solicitacoes")
				.session(sessao)
				.param("departamentoResponsavelId", departamentoId.toString()))
			.andExpect(status().isOk());
	}

	@Test
	void configura_A_Expiracao_Apos_Dez_Minutos_De_Inatividade() throws Exception {
		// Given
		Duration limiteDeInatividade = Duration.ofMinutes(10);

		// When
		MockHttpSession sessao = abrirSessaoComCodigoValido();

		// Then
		assertEquals(limiteDeInatividade.toSeconds(), sessao.getMaxInactiveInterval());
	}

	@Test
	void bloqueia_A_Sexta_Tentativa_Do_Mesmo_Ip_Apos_Cinco_Codigos_Incorretos() throws Exception {
		// Given
		String codigoIncorreto = "codigo-incorreto";
		RequestPostProcessor mesmaOrigem = requisicao -> {
			requisicao.setRemoteAddr("192.0.2.13");
			return requisicao;
		};
		int tentativasPermitidas = 5;
		for (int tentativa = 0; tentativa < tentativasPermitidas; tentativa++) {
			mvc.perform(pedidoDeAcesso(codigoIncorreto).with(mesmaOrigem))
				.andExpect(status().isUnauthorized());
		}

		// When & Then
		mvc.perform(pedidoDeAcesso(codigoIncorreto).with(mesmaOrigem))
			.andExpect(status().isTooManyRequests())
			.andExpect(header().exists(HttpHeaders.RETRY_AFTER));
		mvc.perform(pedidoDeAcesso(CODIGO_DE_TESTE))
			.andExpect(status().isNoContent());
	}

	private MockHttpSession abrirSessaoComCodigoValido() throws Exception {
		MvcResult acesso = mvc.perform(pedidoDeAcesso(CODIGO_DE_TESTE))
			.andExpect(status().isNoContent())
			.andReturn();
		return assertInstanceOf(MockHttpSession.class, acesso.getRequest().getSession(false));
	}

	private MockHttpServletRequestBuilder pedidoDeAcesso(String codigo) {
		return post("/api/acesso")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"codigo": "%s"}
				""".formatted(codigo));
	}
}
