package com.asist.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.asist.entity.Turno;

@Repository
public interface TurnoRepository extends CrudRepository<Turno, Integer>, PagingAndSortingRepository<Turno, Integer>{

	Page<Turno> findAll(Pageable pageable);
	
	Page<Turno> findByTipoLikeIgnoreCase(String tipo, Pageable pageable);
	
}
