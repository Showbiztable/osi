package io.github.showbiztable.osi.departamento;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface DepartamentoRepository extends JpaRepository<Departamento, Long> {

	List<Departamento> findAllByOrderByNomeAsc();
}
