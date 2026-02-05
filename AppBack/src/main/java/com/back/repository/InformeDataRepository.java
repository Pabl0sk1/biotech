package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.InformeData;

@Repository
public interface InformeDataRepository extends CrudRepository<InformeData, Integer>, PagingAndSortingRepository<InformeData, Integer>, JpaSpecificationExecutor<InformeData> {
	
	@Query("SELECT i FROM InformeData i WHERE i.informe.id = ?1")
	Optional<InformeData> findByInformeId(Integer informeId);
	
}
