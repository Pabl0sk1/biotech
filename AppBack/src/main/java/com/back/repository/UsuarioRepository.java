package com.back.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Usuario;

@Repository
public interface UsuarioRepository extends CrudRepository<Usuario, Integer>, PagingAndSortingRepository<Usuario, Integer>, JpaSpecificationExecutor<Usuario> {
	
	Optional<Usuario> findByNombreusuario(String nombreusuario);

}
