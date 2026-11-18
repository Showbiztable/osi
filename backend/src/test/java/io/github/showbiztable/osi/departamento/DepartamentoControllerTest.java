package io.github.showbiztable.osi.departamento;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

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
		mvc.perform(get("/api/departamentos"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.nome == 'Financeiro' && @.id == %d)]", financeiroId).isNotEmpty())
			.andExpect(jsonPath("$[?(@.nome == 'TI' && @.id == %d)]", tiId).isNotEmpty());
	}

	private long buscarIdDepartamento(String nome) {
		return jdbcClient.sql("SELECT id FROM departamento WHERE nome = :nome")
			.param("nome", nome)
			.query(Long.class)
			.single();
	}
}
