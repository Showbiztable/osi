package io.github.showbiztable.osi.solicitacao;

import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
class SolicitacaoRepository {

	Solicitacao saveAndFlush(Solicitacao solicitacao) {
		return solicitacao;
	}

	Optional<Solicitacao> findById(Long id) {
		return Optional.empty();
	}
}
