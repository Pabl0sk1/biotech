package com.back.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.back.entity.Usuario;

@Repository
public interface UsuarioRepository extends CrudRepository<Usuario, Integer>, PagingAndSortingRepository<Usuario, Integer> {
	
	Page<Usuario> findAll(Pageable pageable);
	
    Page<Usuario> findByNombreusuarioLikeIgnoreCase(String nombreusuario, Pageable pageable);
    
    Optional<Usuario> findByNombreusuario(String nombreusuario);
    
    Page<Usuario> findByEstado(Character estado, Pageable pageable);
    
    @Query("SELECT u FROM Usuario u WHERE u.tipousuario.id = ?1")
    Page<Usuario> findByIdRol(Integer id, Pageable pageable);
    
    Page<Usuario> findByNombreusuarioLikeIgnoreCaseAndEstado(String nombreusuario, Character estado, Pageable pageable);
    
    @Query("SELECT u FROM Usuario u WHERE u.tipousuario.id = ?2 AND LOWER(u.nombreusuario) LIKE LOWER(CONCAT('%', ?1, '%'))")
    Page<Usuario> findByNombreusuarioLikeIgnoreCaseAndIdRol(String nombreusuario, Integer id, Pageable pageable);
    
    @Query("SELECT u FROM Usuario u WHERE u.tipousuario.id = ?1 AND u.estado = ?2")
    Page<Usuario> findByEstadoLikeIgnoreCaseAndIdRol(Integer id, Character estado, Pageable pageable);
    
    @Query("SELECT u FROM Usuario u WHERE u.tipousuario.id = ?2 AND LOWER(u.nombreusuario) LIKE LOWER(CONCAT('%', ?1, '%')) AND u.estado = ?3")
    Page<Usuario> findByNombreusuarioLikeIgnoreCaseAndIdRolAndEstado(String nombreusuario, Integer id, Character estado, Pageable pageable);

}
