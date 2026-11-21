package io.github.showbiztable.osi.departamento;

import org.springframework.stereotype.Service;

@Service
public class ConsultaDepartamentos {

	private final DepartamentoRepository repository;

	ConsultaDepartamentos(DepartamentoRepository repository) {
		this.repository = repository;
	}

	public boolean existe(long departamentoId) {
		return repository.existsById(departamentoId);
	}
}
