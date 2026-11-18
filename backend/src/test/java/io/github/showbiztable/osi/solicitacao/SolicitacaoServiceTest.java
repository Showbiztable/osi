package io.github.showbiztable.osi.solicitacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

@Tag("integration")
@SpringBootTest
@Transactional
class SolicitacaoServiceTest {

	private final SolicitacaoService service;
	private final JdbcClient jdbcClient;

	@Autowired
	SolicitacaoServiceTest(SolicitacaoService service, JdbcClient jdbcClient) {
		this.service = service;
		this.jdbcClient = jdbcClient;
	}

	@Test
	void cadastra_A_Solicitacao_E_Devolve_O_Id_Gerado() {
		// Given
		String descricao = "O sistema de notas fiscais não abre.";
		long solicitanteId = buscarIdDepartamento("Financeiro");
		long responsavelId = buscarIdDepartamento("TI");

		// When
		Long id = service.cadastrar(descricao, solicitanteId, responsavelId, Prioridade.ALTA);

		// Then
		assertNotNull(id, "O cadastro deve devolver o ID da solicitação gravada");
		String descricaoGravada = jdbcClient.sql("SELECT descricao FROM solicitacao WHERE id = :id")
			.param("id", id)
			.query(String.class)
			.optional()
			.orElse(null);
		assertEquals(descricao, descricaoGravada);
	}

	private long buscarIdDepartamento(String nome) {
		return jdbcClient.sql("SELECT id FROM departamento WHERE nome = :nome")
			.param("nome", nome)
			.query(Long.class)
			.single();
	}
}
