package io.github.showbiztable.osi.solicitacao;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class SolicitacaoController {

	private final SolicitacaoService service;

	SolicitacaoController(SolicitacaoService service) {
		this.service = service;
	}

	@PostMapping("/api/solicitacoes")
	ResponseEntity<SolicitacaoCriada> cadastrar(@RequestBody DadosCadastro dados) {
		Long id = service.cadastrar(
			dados.descricao(), dados.departamentoSolicitanteId(), dados.departamentoResponsavelId(), dados.prioridade()
		);
		return ResponseEntity.status(HttpStatus.CREATED).body(new SolicitacaoCriada(id));
	}

	record DadosCadastro(
		String descricao, 
		long departamentoSolicitanteId, 
		long departamentoResponsavelId,
		Prioridade prioridade
	) {}

	record SolicitacaoCriada(Long id) {}
}
