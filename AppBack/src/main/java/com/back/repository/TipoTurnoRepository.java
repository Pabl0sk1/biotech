package com.back.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.back.entity.TipoTurno;

@Repository
public interface TipoTurnoRepository extends CrudRepository<TipoTurno, Integer>, PagingAndSortingRepository<TipoTurno, Integer> {

	Page<TipoTurno> findAll(Pageable pageable);
	
	Page<TipoTurno> findByTipoLikeIgnoreCase(String tipo, Pageable pageable);
	
}
