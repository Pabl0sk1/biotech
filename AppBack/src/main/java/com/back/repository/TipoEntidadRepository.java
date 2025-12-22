package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.TipoEntidad;

@Repository
public interface TipoEntidadRepository extends CrudRepository<TipoEntidad, Integer>, PagingAndSortingRepository<TipoEntidad, Integer>, JpaSpecificationExecutor<TipoEntidad> {
	
}
