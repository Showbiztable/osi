package io.github.showbiztable.osi.solicitacao;

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
		assertEquals(instanteDoCadastro, solicitacao.entrada());
	}
}
