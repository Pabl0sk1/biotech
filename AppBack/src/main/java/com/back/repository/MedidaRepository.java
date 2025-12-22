package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Medida;

@Repository
public interface MedidaRepository extends CrudRepository<Medida, Integer>, PagingAndSortingRepository<Medida, Integer>, JpaSpecificationExecutor<Medida> {
	
}
