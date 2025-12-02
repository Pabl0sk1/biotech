package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Turno;

@Repository
public interface TurnoRepository extends CrudRepository<Turno, Integer>, PagingAndSortingRepository<Turno, Integer>, JpaSpecificationExecutor<Turno> {
	
}
