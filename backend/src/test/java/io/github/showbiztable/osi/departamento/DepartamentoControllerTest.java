package io.github.showbiztable.osi.departamento;

import static io.github.showbiztable.osi.acesso.ConfiguracaoSessaoDemo.SESSAO_AUTENTICADA;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

@Tag("integration")
@SpringBootTest
@AutoConfigureMockMvc
class DepartamentoControllerTest {

	private final MockMvc mvc;
	private final JdbcClient jdbcClient;

	@Autowired
	DepartamentoControllerTest(MockMvc mvc, JdbcClient jdbcClient) {
		this.mvc = mvc;
		this.jdbcClient = jdbcClient;
	}

	@Test
	void lista_Os_Departamentos_Cadastrados_Com_Id_E_Nome() throws Exception {
		// Given
		long financeiroId = buscarIdDepartamento("Financeiro");
		long tiId = buscarIdDepartamento("TI");

		// When & Then
		mvc.perform(get("/api/departamentos").sessionAttr(SESSAO_AUTENTICADA, true))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.nome == 'Financeiro' && @.id == %d)]", financeiroId).isNotEmpty())
			.andExpect(jsonPath("$[?(@.nome == 'TI' && @.id == %d)]", tiId).isNotEmpty());
	}

	@Test
	@Transactional
	void cadastra_O_Departamento_Com_O_Nome_Normalizado() throws Exception {
		// Given
		String nome = "Departamento " + UUID.randomUUID();
		String corpo = """
			{"nome": "  %s  "}
			""".formatted(nome);

		// When
		ResultActions resposta = cadastrar(corpo);

		// Then
		resposta.andExpect(status().isCreated())
			.andExpect(jsonPath("$.id").value(is(buscarIdDepartamento(nome)), Long.class))
			.andExpect(jsonPath("$.nome").value(nome));
	}

	@ParameterizedTest
	@ValueSource(strings = { "{}", "{\"nome\": \"   \"}" })
	void rejeita_O_Cadastro_Com_Nome_Ausente_Ou_Em_Branco(String corpo) throws Exception {
		// When & Then
		cadastrar(corpo).andExpect(status().isBadRequest());
	}

	@ParameterizedTest
	@ValueSource(strings = { "TI", "  ti  " })
	void rejeita_O_Cadastro_Quando_O_Departamento_Ja_Existe(String nome) throws Exception {
		// Given
		String corpo = """
			{"nome": "%s"}
			""".formatted(nome);

		// When & Then
		cadastrar(corpo).andExpect(status().isConflict());
	}

	private ResultActions cadastrar(String corpo) throws Exception {
		return mvc.perform(post("/api/departamentos")
			.sessionAttr(SESSAO_AUTENTICADA, true)
			.contentType(MediaType.APPLICATION_JSON)
			.content(corpo));
	}

	private long buscarIdDepartamento(String nome) {
		return jdbcClient.sql("SELECT id FROM departamento WHERE nome = :nome")
			.param("nome", nome)
			.query(Long.class)
			.single();
	}
}
