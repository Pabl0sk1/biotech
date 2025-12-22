package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Menu;

@Repository
public interface MenuRepository extends CrudRepository<Menu, Integer>, PagingAndSortingRepository<Menu, Integer>, JpaSpecificationExecutor<Menu> {
	
}
