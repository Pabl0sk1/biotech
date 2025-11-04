package com.back.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.back.entity.TipoUsuario;

@Repository
public interface TipoUsuarioRepository extends CrudRepository<TipoUsuario, Integer>, PagingAndSortingRepository<TipoUsuario, Integer> {
	
	Page<TipoUsuario> findAll(Pageable pageable);
	
	Page<TipoUsuario> findByTipousuarioLikeIgnoreCase(String tipousuario, Pageable pageable);

}
