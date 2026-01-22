package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Comision;

@Repository
public interface ComisionRepository extends CrudRepository<Comision, Integer>, PagingAndSortingRepository<Comision, Integer>, JpaSpecificationExecutor<Comision> {
	
	Optional<Comision> findByErpid(Integer erpid);
	
}
