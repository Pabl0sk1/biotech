package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Cartera;

@Repository
public interface CarteraRepository extends CrudRepository<Cartera, Integer>, PagingAndSortingRepository<Cartera, Integer>, JpaSpecificationExecutor<Cartera> {
	
	Optional<Cartera> findByErpid(Integer erpid);
	
}
