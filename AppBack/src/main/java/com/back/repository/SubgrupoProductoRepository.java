package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.SubgrupoProducto;

@Repository
public interface SubgrupoProductoRepository extends CrudRepository<SubgrupoProducto, Integer>, PagingAndSortingRepository<SubgrupoProducto, Integer>, JpaSpecificationExecutor<SubgrupoProducto> {
	
}
