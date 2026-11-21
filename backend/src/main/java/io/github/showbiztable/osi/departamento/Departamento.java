package io.github.showbiztable.osi.departamento;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "departamento")
class Departamento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nome;

	protected Departamento() {
	}

	Departamento(String nome) {
		if (nome == null || nome.isBlank()) {
			throw new IllegalArgumentException("O nome do departamento é obrigatório.");
		}
		this.nome = nome.strip();
	}

	Long getId() {
		return id;
	}

	String getNome() {
		return nome;
	}
}
