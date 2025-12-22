package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.PrincipioActivo;

@Repository
public interface PrincipioActivoRepository extends CrudRepository<PrincipioActivo, Integer>, PagingAndSortingRepository<PrincipioActivo, Integer>, JpaSpecificationExecutor<PrincipioActivo> {
	
}
