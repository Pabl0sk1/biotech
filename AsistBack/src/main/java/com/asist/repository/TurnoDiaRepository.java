package com.asist.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.asist.entity.TurnoDia;

@Repository
public interface TurnoDiaRepository extends CrudRepository<TurnoDia, Integer>, PagingAndSortingRepository<TurnoDia, Integer> {

}
