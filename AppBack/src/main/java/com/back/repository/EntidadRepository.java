package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Entidad;

@Repository
public interface EntidadRepository extends CrudRepository<Entidad, Integer>, PagingAndSortingRepository<Entidad, Integer>, JpaSpecificationExecutor<Entidad> {
	
	Optional<Entidad> findByErpid(Integer erpid);
	
}
