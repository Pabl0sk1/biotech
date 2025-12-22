package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Submenu;

@Repository
public interface SubmenuRepository extends CrudRepository<Submenu, Integer>, PagingAndSortingRepository<Submenu, Integer>, JpaSpecificationExecutor<Submenu> {
	
}
