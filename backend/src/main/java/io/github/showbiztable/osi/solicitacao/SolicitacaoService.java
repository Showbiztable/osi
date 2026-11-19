package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
class SolicitacaoService {

	private final SolicitacaoRepository repository;

	SolicitacaoService(SolicitacaoRepository repository) {
		this.repository = repository;
	}

	List<Solicitacao> listarFila(long departamentoResponsavelId) {
		return repository.listarFilaAtivaPorDepartamentoResponsavel(departamentoResponsavelId);
	}

	Long cadastrar(String descricao, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade) {
		Solicitacao solicitacao = Solicitacao.cadastrar(
			descricao, departamentoSolicitanteId, departamentoResponsavelId, prioridade, Clock.systemUTC()
		);
		return repository.save(solicitacao).getId();
	}
}
