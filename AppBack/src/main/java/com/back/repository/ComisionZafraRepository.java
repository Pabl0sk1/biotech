package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.ComisionZafra;

@Repository
public interface ComisionZafraRepository extends CrudRepository<ComisionZafra, Integer>, PagingAndSortingRepository<ComisionZafra, Integer>, JpaSpecificationExecutor<ComisionZafra> {

}
