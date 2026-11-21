package io.github.showbiztable.osi.acesso;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AcessoDemoController.class)
@Import(ConfiguracaoSessaoDemo.class)
class AcessoDemoControllerTest {

	private final MockMvc mvc;

	@MockitoBean
	private DataSource dataSource;

	@Autowired
	AcessoDemoControllerTest(MockMvc mvc) {
		this.mvc = mvc;
	}

	@Test
	void informa_A_Indisponibilidade_Quando_O_Banco_Nao_Aceita_Conexoes() throws Exception {
		// Given
		when(dataSource.getConnection()).thenThrow(new SQLException("Banco indisponível"));

		// When & Then
		mvc.perform(get("/api/prontidao"))
			.andExpect(status().isServiceUnavailable())
			.andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
			.andExpect(resultado -> assertNull(resultado.getRequest().getSession(false)));
	}

	@Test
	void libera_A_Conexao_Quando_A_Verificacao_Do_Banco_Falha() throws Exception {
		// Given
		Connection conexao = mock(Connection.class);
		when(dataSource.getConnection()).thenReturn(conexao);
		when(conexao.isValid(anyInt())).thenReturn(false);

		// When
		mvc.perform(get("/api/prontidao")).andExpect(status().isServiceUnavailable());

		// Then
		verify(conexao).close();
	}
}
