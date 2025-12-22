package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Programa;

@Repository
public interface ProgramaRepository extends CrudRepository<Programa, Integer>, PagingAndSortingRepository<Programa, Integer>, JpaSpecificationExecutor<Programa> {
	
}
