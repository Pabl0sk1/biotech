package com.asist.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.asist.entity.Funcionario;

@Repository
public interface FuncionarioRepository extends CrudRepository<Funcionario, Integer>, PagingAndSortingRepository<Funcionario, Integer> {
	
	Page<Funcionario> findAll(Pageable pageable);
	
	Page<Funcionario> findByNrodocLikeIgnoreCase(String nrodoc, Pageable pageable);
	
	Page<Funcionario> findByNombreLikeIgnoreCase(String nombre, Pageable pageable);
	
	Page<Funcionario> findByNrodocLikeIgnoreCaseAndNombreLikeIgnoreCase(String nrodoc, String nombre, Pageable pageable);
	
	List<Funcionario> findByNombreLikeIgnoreCaseOrNrodocLike(String nombre, String nrodoc);

}
