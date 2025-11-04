package com.back.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.back.entity.TurnoDia;

@Repository
public interface TurnoDiaRepository extends CrudRepository<TurnoDia, Integer>, PagingAndSortingRepository<TurnoDia, Integer> {

}
