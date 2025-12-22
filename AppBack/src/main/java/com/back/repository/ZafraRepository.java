package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Zafra;

@Repository
public interface ZafraRepository extends CrudRepository<Zafra, Integer>, PagingAndSortingRepository<Zafra, Integer>, JpaSpecificationExecutor<Zafra> {
	
}
