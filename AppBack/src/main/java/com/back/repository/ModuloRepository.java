package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Modulo;

@Repository
public interface ModuloRepository extends CrudRepository<Modulo, Integer>, PagingAndSortingRepository<Modulo, Integer>, JpaSpecificationExecutor<Modulo> {

}
