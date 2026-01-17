package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Informe;

@Repository
public interface InformeRepository extends CrudRepository<Informe, Integer>, PagingAndSortingRepository<Informe, Integer>, JpaSpecificationExecutor<Informe> {
	
}
