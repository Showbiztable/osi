package io.github.showbiztable.osi.departamento;

import java.util.List;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class DepartamentoController {

	private static final String INDICE_NOME_UNICO = "departamento_nome_normalizado_uidx";

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

	@PostMapping("/api/departamentos")
	ResponseEntity<DepartamentoResumo> cadastrar(@RequestBody DadosCadastro dados) {
		Departamento departamento;
		try {
			departamento = new Departamento(dados.nome());
		} catch (IllegalArgumentException erro) {
			return ResponseEntity.badRequest().build();
		}

		try {
			Departamento cadastrado = repository.save(departamento);
			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new DepartamentoResumo(cadastrado.getId(), cadastrado.getNome()));
		} catch (DataIntegrityViolationException erro) {
			if (erro.getCause() instanceof ConstraintViolationException violacao
				&& INDICE_NOME_UNICO.equals(violacao.getConstraintName())) {
				return ResponseEntity.status(HttpStatus.CONFLICT).build();
			}
			throw erro;
		}
	}

	record DadosCadastro(String nome) {
	}

	record DepartamentoResumo(Long id, String nome) {
	}
}
