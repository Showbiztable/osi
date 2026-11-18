package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.time.Instant;

class Solicitacao {

	private final Instant entrada;
	private final long departamentoSolicitanteId;
	private final long departamentoResponsavelId;
	private final Prioridade prioridade;
	private final String descricao;

	private Solicitacao(Instant entrada, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade, String descricao) {
		this.entrada = entrada;
		this.departamentoSolicitanteId = departamentoSolicitanteId;
		this.departamentoResponsavelId = departamentoResponsavelId;
		this.prioridade = prioridade;
		this.descricao = descricao;
	}

	Long getId() {
		return null;
	}

	Instant getEntrada() {
		return entrada;
	}

	long getDepartamentoSolicitanteId() {
		return departamentoSolicitanteId;
	}

	long getDepartamentoResponsavelId() {
		return departamentoResponsavelId;
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

	static Solicitacao cadastrar(String descricao, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade, Clock relogio) {
		return new Solicitacao(relogio.instant(), departamentoSolicitanteId, departamentoResponsavelId,
			prioridade, descricao);
	}
}
