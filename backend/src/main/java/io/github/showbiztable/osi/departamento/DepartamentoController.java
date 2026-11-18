package io.github.showbiztable.osi.departamento;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class DepartamentoController {

	@GetMapping("/api/departamentos")
	ResponseEntity<Void> listar() {
		return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
	}
}
