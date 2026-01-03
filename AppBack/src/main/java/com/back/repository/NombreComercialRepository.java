package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.NombreComercial;

@Repository
public interface NombreComercialRepository extends CrudRepository<NombreComercial, Integer>, PagingAndSortingRepository<NombreComercial, Integer>, JpaSpecificationExecutor<NombreComercial> {
	
	Optional<NombreComercial> findByErpid(Integer erpid);
	
}
