package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.time.Instant;

class Solicitacao {

	private final Instant entrada;
	private final String departamentoSolicitante;
	private final String departamentoResponsavel;

	private Solicitacao(Instant entrada, String departamentoSolicitante, String departamentoResponsavel) {
		this.entrada = entrada;
		this.departamentoSolicitante = departamentoSolicitante;
		this.departamentoResponsavel = departamentoResponsavel;
	}

	Instant getEntrada() {
		return entrada;
	}

	String getDepartamentoSolicitante() {
		return departamentoSolicitante;
	}

	String getDepartamentoResponsavel() {
		return departamentoResponsavel;
	}

	static Solicitacao cadastrar(String descricao, String departamentoSolicitante, String departamentoResponsavel,
		Prioridade prioridade, Clock relogio) {
		return new Solicitacao(relogio.instant(), departamentoSolicitante, departamentoResponsavel);
	}
}
