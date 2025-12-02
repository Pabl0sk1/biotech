package com.back.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.back.entity.Funcionario;

@Repository
public interface FuncionarioRepository extends CrudRepository<Funcionario, Integer>, PagingAndSortingRepository<Funcionario, Integer>, JpaSpecificationExecutor<Funcionario> {

}
