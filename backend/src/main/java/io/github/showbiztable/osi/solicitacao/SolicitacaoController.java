package io.github.showbiztable.osi.solicitacao;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class SolicitacaoController {

	private final SolicitacaoService service;

	SolicitacaoController(SolicitacaoService service) {
		this.service = service;
	}

	@GetMapping("/api/solicitacoes")
	List<ItemFila> listarFila(@RequestParam("departamentoResponsavelId") long departamentoResponsavelId) {
		return service.listarFila(departamentoResponsavelId).stream()
			.map(solicitacao -> new ItemFila(
				solicitacao.getId(),
				solicitacao.getDescricao(),
				solicitacao.getDepartamentoSolicitanteId(),
				solicitacao.getPrioridade(),
				solicitacao.getEntrada()
			))
			.toList();
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

	record ItemFila(
		Long id,
		String descricao,
		long departamentoSolicitanteId,
		Prioridade prioridade,
		Instant entrada
	) {}
}
