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

import com.back.entity.Turno;
import com.back.repository.TurnoRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class TurnoService {

	@Autowired
	TurnoRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<Turno> listar() {
		List<Turno> result = new ArrayList<Turno>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<Turno> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public Turno guardar(Turno turno) {
		Set<ConstraintViolation<Turno>> violations = validator.validate(turno);
		String errorValidation = "";
		for (ConstraintViolation<Turno> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(turno);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public Turno buscarPorId(Integer id) {

		Optional<Turno> turno = rep.findById(id);

		if (turno.isPresent()) {
			return turno.get();
		} else {
			throw new RuntimeException("No se encontro el turno con ID: " + id);
		}

	}
	
	public Page<Turno> BuscarPorIdTipo(Integer id, Pageable pageable){
		return rep.findByIdTipo(id, pageable);
	}
	
}
