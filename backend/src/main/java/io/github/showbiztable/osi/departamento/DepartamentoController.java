package io.github.showbiztable.osi.departamento;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class DepartamentoController {

	private final DepartamentoRepository repository;

	DepartamentoController(DepartamentoRepository repository) {
		this.repository = repository;
	}

	@GetMapping("/api/departamentos")
	List<DepartamentoResumo> listar() {
		return repository.findAllByOrderByNomeAsc().stream()
			.map(departamento -> new DepartamentoResumo(departamento.getId(), departamento.getNome()))
			.toList();
	}

	record DepartamentoResumo(Long id, String nome) {
	}
}
