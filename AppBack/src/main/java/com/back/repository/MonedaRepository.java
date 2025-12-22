package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Moneda;

@Repository
public interface MonedaRepository extends CrudRepository<Moneda, Integer>, PagingAndSortingRepository<Moneda, Integer>, JpaSpecificationExecutor<Moneda> {
	
}
