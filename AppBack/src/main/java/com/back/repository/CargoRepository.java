package com.back.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.back.entity.Cargo;

@Repository
public interface CargoRepository extends CrudRepository<Cargo, Integer>, PagingAndSortingRepository<Cargo, Integer> {

	Page<Cargo> findAll(Pageable pageable);
	
	Page<Cargo> findByCargoLikeIgnoreCase(String cargo, Pageable pageable);
	
}
