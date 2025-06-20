package com.asist.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.asist.entity.Configuracion;

@Repository
public interface ConfiguracionRepository extends CrudRepository<Configuracion, Integer>, PagingAndSortingRepository<Configuracion, Integer> {
	
	Page<Configuracion> findAll(Pageable pageable);
	
}