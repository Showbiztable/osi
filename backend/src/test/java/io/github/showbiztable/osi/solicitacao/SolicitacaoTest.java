package io.github.showbiztable.osi.solicitacao;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class SolicitacaoTest {

	private static final long DEPARTAMENTO_SOLICITANTE_ID = 10L;
	private static final long DEPARTAMENTO_RESPONSAVEL_ID = 20L;

	@Test
	void registra_Automaticamente_O_Instante_De_Entrada_No_Cadastro() {
		// Given
		Instant instanteDoCadastro = Instant.parse("2026-11-18T12:15:00Z");
		Clock relogio = Clock.fixed(instanteDoCadastro, ZoneOffset.UTC);

		// When
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Acesso ao sistema de notas fiscais",
			DEPARTAMENTO_SOLICITANTE_ID,
			DEPARTAMENTO_RESPONSAVEL_ID,
			Prioridade.ALTA,
			relogio
		);

		// Then
		assertEquals(instanteDoCadastro, solicitacao.getEntrada());
	}

	@Test
	void identifica_O_Departamento_Solicitante_E_O_Responsavel_No_Cadastro() {
		// Given & When
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Acesso ao sistema de notas fiscais",
			DEPARTAMENTO_SOLICITANTE_ID,
			DEPARTAMENTO_RESPONSAVEL_ID,
			Prioridade.ALTA,
			Clock.systemUTC()
		);

		// Then
		assertAll(
			() -> assertEquals(DEPARTAMENTO_SOLICITANTE_ID, solicitacao.getDepartamentoSolicitanteId()),
			() -> assertEquals(DEPARTAMENTO_RESPONSAVEL_ID, solicitacao.getDepartamentoResponsavelId())
		);
	}

	@ParameterizedTest
	@EnumSource(Prioridade.class)
	void registra_A_Prioridade_Informada_No_Cadastro(Prioridade prioridadeInformada) {
		// Given & When
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Acesso ao sistema de notas fiscais",
			DEPARTAMENTO_SOLICITANTE_ID,
			DEPARTAMENTO_RESPONSAVEL_ID,
			prioridadeInformada,
			Clock.systemUTC()
		);

		// Then
		assertEquals(prioridadeInformada, solicitacao.getPrioridade());
	}

	@Test
	void altera_A_Prioridade_Preservando_O_Instante_De_Entrada() {
		// Given
		Instant instanteDoCadastro = Instant.parse("2026-11-18T12:15:00Z");
		Clock relogio = Clock.fixed(instanteDoCadastro, ZoneOffset.UTC);
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Acesso ao sistema de notas fiscais",
			DEPARTAMENTO_SOLICITANTE_ID,
			DEPARTAMENTO_RESPONSAVEL_ID,
			Prioridade.BAIXA,
			relogio
		);

		// When
		solicitacao.alterarPrioridade(Prioridade.ALTA);

		// Then
		assertAll(
			() -> assertEquals(Prioridade.ALTA, solicitacao.getPrioridade()),
			() -> assertEquals(instanteDoCadastro, solicitacao.getEntrada())
		);
	}

	@Test
	void registra_A_Descricao_Informada_No_Cadastro() {
		// Given
		String descricaoInformada = "O sistema de notas fiscais não abre.";

		// When
		Solicitacao solicitacao = Solicitacao.cadastrar(
			descricaoInformada,
			DEPARTAMENTO_SOLICITANTE_ID,
			DEPARTAMENTO_RESPONSAVEL_ID,
			Prioridade.ALTA,
			Clock.systemUTC()
		);

		// Then
		assertEquals(descricaoInformada, solicitacao.getDescricao());
	}

	@Test
	void inicia_Ativa_Ao_Cadastrar_Uma_Solicitacao() {
		// Given & When
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Acesso ao sistema de notas fiscais",
			DEPARTAMENTO_SOLICITANTE_ID,
			DEPARTAMENTO_RESPONSAVEL_ID,
			Prioridade.ALTA,
			Clock.systemUTC()
		);

		// Then
		assertTrue(solicitacao.isAtiva());
	}
}
