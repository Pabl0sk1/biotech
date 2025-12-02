package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import com.back.entity.Token;

public interface TokenRepository extends CrudRepository<Token, Integer>, PagingAndSortingRepository<Token, Integer>, JpaSpecificationExecutor<Token> {
	
}
