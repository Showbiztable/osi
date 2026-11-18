package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.time.Instant;

class Solicitacao {

	private final Instant entrada;

	private Solicitacao(Instant entrada) {
		this.entrada = entrada;
	}

	static Solicitacao cadastrar(String descricao, String departamentoSolicitante, String departamentoResponsavel, 
		Prioridade prioridade, Clock relogio) {
		return new Solicitacao(relogio.instant());
	}

	Instant entrada() {
		return entrada;
	}

	String departamentoSolicitante() {
		return null;
	}

	String departamentoResponsavel() {
		return null;
	}
}
