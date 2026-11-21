package io.github.showbiztable.osi.solicitacao;

import java.time.Clock;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.showbiztable.osi.departamento.ConsultaDepartamentos;

@Service
class SolicitacaoService {

	private final SolicitacaoRepository repository;
	private final ConsultaDepartamentos departamentos;

	SolicitacaoService(SolicitacaoRepository repository, ConsultaDepartamentos departamentos) {
		this.repository = repository;
		this.departamentos = departamentos;
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

	@Transactional
	Long cadastrar(String descricao, long departamentoSolicitanteId, long departamentoResponsavelId,
		Prioridade prioridade) {
		Solicitacao solicitacao = Solicitacao.cadastrar(
			descricao, departamentoSolicitanteId, departamentoResponsavelId, prioridade, Clock.systemUTC()
		);
		if (!departamentos.existe(departamentoSolicitanteId) || !departamentos.existe(departamentoResponsavelId)) {
			throw new IllegalArgumentException("Os departamentos da solicitação precisam estar cadastrados.");
		}
		return repository.save(solicitacao).getId();
	}

	@Transactional
	void alterarPrioridade(long solicitacaoId, Prioridade novaPrioridade) {
		buscarPorId(solicitacaoId).alterarPrioridade(novaPrioridade);
	}

	@Transactional
	void alterarDescricao(long solicitacaoId, String novaDescricao) {
		buscarPorId(solicitacaoId).alterarDescricao(novaDescricao);
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
