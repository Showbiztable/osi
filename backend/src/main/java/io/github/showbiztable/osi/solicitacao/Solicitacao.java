package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.time.Instant;

class Solicitacao {

	private final Instant entrada;
	private final String departamentoSolicitante;
	private final String departamentoResponsavel;
	private final Prioridade prioridade;
	private final String descricao;

	private Solicitacao(Instant entrada, String departamentoSolicitante, String departamentoResponsavel,
		Prioridade prioridade, String descricao) {
		this.entrada = entrada;
		this.departamentoSolicitante = departamentoSolicitante;
		this.departamentoResponsavel = departamentoResponsavel;
		this.prioridade = prioridade;
		this.descricao = descricao;
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

	Prioridade getPrioridade() {
		return prioridade;
	}

	String getDescricao() {
		return descricao;
	}

	boolean isAtiva() {
		return true;
	}

	static Solicitacao cadastrar(String descricao, String departamentoSolicitante, String departamentoResponsavel,
		Prioridade prioridade, Clock relogio) {
		return new Solicitacao(relogio.instant(), departamentoSolicitante, departamentoResponsavel, prioridade, descricao);
	}
}
