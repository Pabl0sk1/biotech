package com.back.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import com.back.entity.Token;

public interface TokenRepository extends CrudRepository<Token, Integer>, PagingAndSortingRepository<Token, Integer> {
	
	Page<Token> findAll(Pageable pageable);
	
	@Query("SELECT t FROM Token t WHERE LOWER(t.usuario.nombreusuario) LIKE LOWER(CONCAT('%', ?1, '%'))")
	Page<Token> findByUsuario(String usuario, Pageable pageable);
	
}
