package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Tributacion;

@Repository
public interface TributacionRepository extends CrudRepository<Tributacion, Integer>, PagingAndSortingRepository<Tributacion, Integer>, JpaSpecificationExecutor<Tributacion> {
	
}
