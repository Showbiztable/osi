package io.github.showbiztable.osi.solicitacao;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

	@PatchMapping("/api/solicitacoes/{id}/prioridade")
	ResponseEntity<Void> alterarPrioridade(@PathVariable("id") long id, @RequestBody DadosPrioridade dados) {
		Prioridade prioridade = dados.prioridade();
		if (prioridade == null) {
			return ResponseEntity.badRequest().build();
		}

		try {
			service.alterarPrioridade(id, prioridade);
		} catch (NoSuchElementException excecao) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/api/solicitacoes/{id}/conclusao")
	ResponseEntity<Void> concluir(@PathVariable("id") long id) {
		service.concluir(id);
		return ResponseEntity.noContent().build();
	}

	record DadosCadastro(
		String descricao, 
		long departamentoSolicitanteId, 
		long departamentoResponsavelId,
		Prioridade prioridade
	) {}

	record SolicitacaoCriada(Long id) {}

	record DadosPrioridade(Prioridade prioridade) {}

	record ItemFila(
		Long id,
		String descricao,
		long departamentoSolicitanteId,
		Prioridade prioridade,
		Instant entrada
	) {}
}
