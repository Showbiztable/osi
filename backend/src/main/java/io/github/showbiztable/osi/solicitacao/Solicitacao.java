package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.time.Instant;

class Solicitacao {

	static Solicitacao cadastrar(String descricao, String departamentoSolicitante, String departamentoResponsavel, 
		Prioridade prioridade, Clock relogio) {
		return new Solicitacao();
	}

	Instant entrada() {
		return null;
	}
}
