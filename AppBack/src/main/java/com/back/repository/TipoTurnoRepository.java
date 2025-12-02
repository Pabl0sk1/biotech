package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.TipoTurno;

@Repository
public interface TipoTurnoRepository extends CrudRepository<TipoTurno, Integer>, PagingAndSortingRepository<TipoTurno, Integer>, JpaSpecificationExecutor<TipoTurno> {
	
}
