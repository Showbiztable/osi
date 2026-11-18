package io.github.showbiztable.osi.solicitacao;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class SolicitacaoController {

	@PostMapping("/api/solicitacoes")
	ResponseEntity<Void> cadastrar() {
		return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
	}
}
