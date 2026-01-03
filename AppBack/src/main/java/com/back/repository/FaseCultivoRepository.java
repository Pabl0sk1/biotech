package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.FaseCultivo;

@Repository
public interface FaseCultivoRepository extends CrudRepository<FaseCultivo, Integer>, PagingAndSortingRepository<FaseCultivo, Integer>, JpaSpecificationExecutor<FaseCultivo> {
	
	Optional<FaseCultivo> findByErpid(Integer erpid);
	
}
