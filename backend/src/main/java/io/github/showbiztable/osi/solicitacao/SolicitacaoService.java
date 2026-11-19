package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;

import org.springframework.stereotype.Service;

@Service
class SolicitacaoService {

	private final SolicitacaoRepository repository;

	SolicitacaoService(SolicitacaoRepository repository) {
		this.repository = repository;
	}

	Long cadastrar(String descricao, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade) {
		Solicitacao solicitacao = Solicitacao.cadastrar(
			descricao, departamentoSolicitanteId, departamentoResponsavelId, prioridade, Clock.systemUTC()
		);
		return repository.save(solicitacao).getId();
	}
}
