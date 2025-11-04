package com.back.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.back.entity.Funcionario;
import com.back.repository.FuncionarioRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class FuncionarioService {

	@Autowired
	FuncionarioRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<Funcionario> listar() {
		List<Funcionario> result = new ArrayList<Funcionario>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<Funcionario> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public Funcionario guardar(Funcionario funcionario) {
		Set<ConstraintViolation<Funcionario>> violations = validator.validate(funcionario);
		String errorValidation = "";
		for (ConstraintViolation<Funcionario> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(funcionario);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public Funcionario buscarPorId(Integer id) {

		Optional<Funcionario> funcionario = rep.findById(id);

		if (funcionario.isPresent()) {
			return funcionario.get();
		} else {
			throw new RuntimeException("No se encontro el funcionario con ID: " + id);
		}

	}
	
	public Page<Funcionario> BuscarPorNrodoc(String nrodoc, Pageable pageable){
		return rep.findByNrodocLikeIgnoreCase(nrodoc, pageable);
	}
	
	public Page<Funcionario> BuscarPorNombre(String nombre, Pageable pageable){
		return rep.findByNombreLikeIgnoreCase(nombre, pageable);
	}
	
	public Page<Funcionario> BuscarPorNrodocYNombre(String nrodoc, String nombre, Pageable pageable){
		return rep.findByNrodocLikeIgnoreCaseAndNombreLikeIgnoreCase(nrodoc, nombre, pageable);
	}
	
	public List<Funcionario> BuscarPorNombreONrodoc(String nombre, String nrodoc){
		return rep.findByNombreLikeIgnoreCaseOrNrodocLike(nombre, nrodoc);
	}

}
