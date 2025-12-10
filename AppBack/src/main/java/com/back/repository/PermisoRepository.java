package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Permiso;

@Repository
public interface PermisoRepository extends CrudRepository<Permiso, Integer>, PagingAndSortingRepository<Permiso, Integer>, JpaSpecificationExecutor<Permiso> {

	@Query("SELECT p FROM Permiso p WHERE p.tipousuario.id = ?1 AND p.modulo.moduloes = ?2")
    Permiso findByTipoUsuarioIdAndModulo(Integer tipoId, String modulo);
	
}
