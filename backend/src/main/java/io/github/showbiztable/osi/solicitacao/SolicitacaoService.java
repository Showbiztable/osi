package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class SolicitacaoService {

	private final SolicitacaoRepository repository;

	SolicitacaoService(SolicitacaoRepository repository) {
		this.repository = repository;
	}

	List<Solicitacao> listarFila(long departamentoResponsavelId) {
		return repository.listarFilaAtivaPorDepartamentoResponsavel(departamentoResponsavelId);
	}

	List<Solicitacao> listarFilaGeral() {
		return repository.listarFilaAtiva();
	}

	List<Solicitacao> listarConcluidas() {
		return repository.listarConcluidas();
	}

	Long cadastrar(String descricao, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade) {
		Solicitacao solicitacao = Solicitacao.cadastrar(
			descricao, departamentoSolicitanteId, departamentoResponsavelId, prioridade, Clock.systemUTC()
		);
		return repository.save(solicitacao).getId();
	}

	@Transactional
	void alterarPrioridade(long solicitacaoId, Prioridade novaPrioridade) {
		buscarPorId(solicitacaoId).alterarPrioridade(novaPrioridade);
	}

	@Transactional
	void concluir(long solicitacaoId) {
		buscarPorId(solicitacaoId).concluir();
	}

	@Transactional
	void reabrir(long solicitacaoId) {
		buscarPorId(solicitacaoId).reabrir();
	}

	private Solicitacao buscarPorId(long solicitacaoId) {
		return repository.findById(solicitacaoId)
			.orElseThrow(() -> new NoSuchElementException("Solicitação não encontrada: " + solicitacaoId));
	}
}
