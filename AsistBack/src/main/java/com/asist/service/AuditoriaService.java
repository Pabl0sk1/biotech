package com.asist.service;

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
import com.asist.entity.Auditoria;
import com.asist.repository.AuditoriaRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class AuditoriaService {

	@Autowired
	AuditoriaRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<Auditoria> listar() {
		List<Auditoria> result = new ArrayList<Auditoria>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<Auditoria> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public Auditoria guardar(Auditoria auditoria) {
		Set<ConstraintViolation<Auditoria>> violations = validator.validate(auditoria);
		String errorValidation = "";
		for (ConstraintViolation<Auditoria> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(auditoria);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public Auditoria buscarPorId(Integer id) {

		Optional<Auditoria> auditoria = rep.findById(id);

		if (auditoria.isPresent()) {
			return auditoria.get();
		} else {
			throw new RuntimeException("No se encontro la auditoria con ID: " + id);
		}

	}
	
	public Page<Auditoria> BuscarPorIdUsuario(Integer id, Pageable pageable){
		return rep.findByIdUsuario(id, pageable);
	}
	
	public Page<Auditoria> BuscarPorOperacion(String operacion, Pageable pageable){
		return rep.findByOperacion(operacion, pageable);
	}
	
	public Page<Auditoria> BuscarPorIdUsuarioYOperacion(Integer id, String operacion, Pageable pageable){
		return rep.findByIdUsuarioAndOperacion(id, operacion, pageable);
	}
	
	public Page<Auditoria> BuscarPorUsuario(String usuario, Pageable pageable){
		return rep.findByUsuario(usuario, pageable);
	}
	
	public Page<Auditoria> BuscarPorUsuarioYOperacion(String usuario, String operacion, Pageable pageable){
		return rep.findByUsuarioAndOperacion(usuario, operacion, pageable);
	}

}
