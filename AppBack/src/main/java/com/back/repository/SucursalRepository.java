package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Sucursal;

@Repository
public interface SucursalRepository extends CrudRepository<Sucursal, Integer>, PagingAndSortingRepository<Sucursal, Integer>, JpaSpecificationExecutor<Sucursal> {

	Optional<Sucursal> findByErpid(Integer erpid);
	
}
