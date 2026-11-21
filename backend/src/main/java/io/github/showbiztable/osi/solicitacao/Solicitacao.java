package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.DynamicUpdate;

@Entity
@DynamicUpdate
@Table(name = "solicitacao")
class Solicitacao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Instant entrada;

	@Column(name = "departamento_solicitante_id")
	private long departamentoSolicitanteId;

	@Column(name = "departamento_responsavel_id")
	private long departamentoResponsavelId;

	@Enumerated(EnumType.STRING)
	private Prioridade prioridade;

	private String descricao;
	private boolean ativa = true;

	protected Solicitacao() {
	}

	private Solicitacao(Instant entrada, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade, String descricao) {
		this.entrada = entrada;
		this.departamentoSolicitanteId = departamentoSolicitanteId;
		this.departamentoResponsavelId = departamentoResponsavelId;
		this.prioridade = prioridade;
		this.descricao = descricao;
	}

	Long getId() {
		return id;
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
		return ativa;
	}

	static Solicitacao cadastrar(String descricao, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade, Clock relogio) {
		return new Solicitacao(relogio.instant(), departamentoSolicitanteId, departamentoResponsavelId,
			prioridade, descricao);
	}

	void alterarPrioridade(Prioridade novaPrioridade) {
		this.prioridade = novaPrioridade;
	}

	void concluir() {
		this.ativa = false;
	}

	void reabrir() {
		this.ativa = true;
	}
}
