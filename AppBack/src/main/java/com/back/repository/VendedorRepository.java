package com.back.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import com.back.entity.Vendedor;

public interface VendedorRepository extends CrudRepository<Vendedor, Integer>, PagingAndSortingRepository<Vendedor, Integer> {
	
	Page<Vendedor> findAll(Pageable pageable);
	
	Page<Vendedor> findByNrodocLikeIgnoreCase(String nrodoc, Pageable pageable);
	
	Page<Vendedor> findByNomapeLikeIgnoreCase(String nomape, Pageable pageable);
	
	Page<Vendedor> findByNrodocLikeIgnoreCaseAndNomapeLikeIgnoreCase(String nrodoc, String nomape, Pageable pageable);
	
	List<Vendedor> findByNomapeLikeIgnoreCaseOrNrodocLike(String nomape, String nrodoc);
	
}
