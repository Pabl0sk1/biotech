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

import com.back.entity.TipoTurno;
import com.back.repository.TipoTurnoRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class TipoTurnoService {

	@Autowired
	TipoTurnoRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<TipoTurno> listar() {
		List<TipoTurno> result = new ArrayList<TipoTurno>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<TipoTurno> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public TipoTurno guardar(TipoTurno tipo) {
		Set<ConstraintViolation<TipoTurno>> violations = validator.validate(tipo);
		String errorValidation = "";
		for (ConstraintViolation<TipoTurno> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(tipo);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public TipoTurno buscarPorId(Integer id) {

		Optional<TipoTurno> tipo = rep.findById(id);

		if (tipo.isPresent()) {
			return tipo.get();
		} else {
			throw new RuntimeException("No se encontro el tipo de turno con ID: " + id);
		}

	}
	
	public Page<TipoTurno> BuscarPorTipo(String tipo, Pageable pageable){
		return rep.findByTipoLikeIgnoreCase(tipo, pageable);
	}
	
}
