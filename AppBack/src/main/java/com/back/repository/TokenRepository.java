package com.back.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import com.back.entity.Token;

public interface TokenRepository extends CrudRepository<Token, Integer>, PagingAndSortingRepository<Token, Integer>, JpaSpecificationExecutor<Token> {
	
	List<Token> findByFechaexpiracionBeforeAndEstadoNot(LocalDate fecha, String estado);
	
	Token findByToken(String token);
	
}
