package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.TipoProducto;

@Repository
public interface TipoProductoRepository extends CrudRepository<TipoProducto, Integer>, PagingAndSortingRepository<TipoProducto, Integer>, JpaSpecificationExecutor<TipoProducto> {
	
}
