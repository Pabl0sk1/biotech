package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Configuracion;

@Repository
public interface ConfiguracionRepository extends CrudRepository<Configuracion, Integer>, PagingAndSortingRepository<Configuracion, Integer>, JpaSpecificationExecutor<Configuracion> {
	
}