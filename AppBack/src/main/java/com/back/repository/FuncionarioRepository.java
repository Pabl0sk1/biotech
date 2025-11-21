package com.back.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Funcionario;

@Repository
public interface FuncionarioRepository extends CrudRepository<Funcionario, Integer>, PagingAndSortingRepository<Funcionario, Integer> {
	
	Page<Funcionario> findAll(Pageable pageable);
	
	Page<Funcionario> findByNrodocLikeIgnoreCase(String nrodoc, Pageable pageable);
	
	Page<Funcionario> findByNomapeLikeIgnoreCase(String nomape, Pageable pageable);
	
	Page<Funcionario> findByNrodocLikeIgnoreCaseAndNomapeLikeIgnoreCase(String nrodoc, String nomape, Pageable pageable);
	
	List<Funcionario> findByNomapeLikeIgnoreCaseOrNrodocLike(String nomape, String nrodoc);

}
