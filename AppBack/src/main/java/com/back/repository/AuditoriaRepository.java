package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Auditoria;

@Repository
public interface AuditoriaRepository extends CrudRepository<Auditoria, Integer>, PagingAndSortingRepository<Auditoria, Integer>, JpaSpecificationExecutor<Auditoria> {
	
}
