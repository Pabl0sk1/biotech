package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.TipoUsuario;

@Repository
public interface TipoUsuarioRepository extends CrudRepository<TipoUsuario, Integer>, PagingAndSortingRepository<TipoUsuario, Integer>, JpaSpecificationExecutor<TipoUsuario> {

}
