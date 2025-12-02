package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Cargo;

@Repository
public interface CargoRepository extends CrudRepository<Cargo, Integer>, PagingAndSortingRepository<Cargo, Integer>, JpaSpecificationExecutor<Cargo> {
	
}
