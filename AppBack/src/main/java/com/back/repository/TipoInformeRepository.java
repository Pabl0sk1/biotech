package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.TipoInforme;

@Repository
public interface TipoInformeRepository extends CrudRepository<TipoInforme, Integer>, PagingAndSortingRepository<TipoInforme, Integer>, JpaSpecificationExecutor<TipoInforme> {
	
}
