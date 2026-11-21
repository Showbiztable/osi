package io.github.showbiztable.osi.departamento;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class DepartamentoTest {

	@Test
	void remove_Os_Espacos_Nas_Extremidades_Do_Nome() {
		// Given
		String nome = "  Recursos Humanos  ";

		// When
		Departamento departamento = new Departamento(nome);

		// Then
		assertEquals("Recursos Humanos", departamento.getNome());
	}

	@ParameterizedTest
	@NullAndEmptySource
	@ValueSource(strings = { "   ", "\t\n" })
	void rejeita_Nome_Ausente_Ou_Em_Branco(String nome) {
		// When & Then
		assertThrows(IllegalArgumentException.class, () -> new Departamento(nome));
	}
}
