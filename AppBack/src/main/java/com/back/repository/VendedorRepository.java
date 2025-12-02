package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import com.back.entity.Vendedor;

public interface VendedorRepository extends CrudRepository<Vendedor, Integer>, PagingAndSortingRepository<Vendedor, Integer>, JpaSpecificationExecutor<Vendedor> {
	
}
