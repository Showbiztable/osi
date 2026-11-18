package io.github.showbiztable.osi.solicitacao;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class SolicitacaoTest {

	@Test
	void registra_Automaticamente_O_Instante_De_Entrada_No_Cadastro() {
		// Given
		Instant instanteDoCadastro = Instant.parse("2026-11-18T12:15:00Z");
		Clock relogio = Clock.fixed(instanteDoCadastro, ZoneOffset.UTC);

		// When
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Acesso ao sistema de notas fiscais",
			"Financeiro",
			"TI",
			Prioridade.ALTA,
			relogio
		);

		// Then
		assertEquals(instanteDoCadastro, solicitacao.getEntrada());
	}

	@Test
	void identifica_O_Departamento_Solicitante_E_O_Responsavel_No_Cadastro() {
		// Given
		String departamentoSolicitante = "Financeiro";
		String departamentoResponsavel = "TI";

		// When
		Solicitacao solicitacao = Solicitacao.cadastrar(
			"Acesso ao sistema de notas fiscais",
			departamentoSolicitante,
			departamentoResponsavel,
			Prioridade.ALTA,
			Clock.systemUTC()
		);

		// Then
		assertAll(
			() -> assertEquals(departamentoSolicitante, solicitacao.getDepartamentoSolicitante()),
			() -> assertEquals(departamentoResponsavel, solicitacao.getDepartamentoResponsavel())
		);
	}
}
