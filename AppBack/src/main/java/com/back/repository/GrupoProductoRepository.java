package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.GrupoProducto;

@Repository
public interface GrupoProductoRepository extends CrudRepository<GrupoProducto, Integer>, PagingAndSortingRepository<GrupoProducto, Integer>, JpaSpecificationExecutor<GrupoProducto> {
	
}
