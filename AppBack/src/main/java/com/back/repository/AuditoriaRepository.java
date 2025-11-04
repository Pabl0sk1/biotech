package com.back.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.back.entity.Auditoria;

@Repository
public interface AuditoriaRepository extends CrudRepository<Auditoria, Integer>, PagingAndSortingRepository<Auditoria, Integer>{
	
	Page<Auditoria> findAll(Pageable pageable);
	
	@Query("SELECT a FROM Auditoria a WHERE a.usuario.id = ?1")
	Page<Auditoria> findByIdUsuario(Integer id, Pageable pageable);
	
	@Query("SELECT a FROM Auditoria a WHERE LOWER(a.usuario.nombreusuario) LIKE LOWER(CONCAT('%', ?1, '%'))")
	Page<Auditoria> findByUsuario(String usuario, Pageable pageable);
	
	Page<Auditoria> findByOperacion(String operacion, Pageable pageable);
	
	@Query("SELECT a FROM Auditoria a WHERE a.usuario.id = ?1 AND a.operacion = ?2")
	Page<Auditoria> findByIdUsuarioAndOperacion(Integer id, String operacion, Pageable pageable);
	
	@Query("SELECT a FROM Auditoria a WHERE LOWER(a.usuario.nombreusuario) LIKE LOWER(CONCAT('%', ?1, '%')) AND a.operacion = ?2")
	Page<Auditoria> findByUsuarioAndOperacion(String usuario, String operacion, Pageable pageable);
	
}
