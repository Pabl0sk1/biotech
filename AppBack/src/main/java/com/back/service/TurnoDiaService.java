package com.back.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.back.entity.TurnoDia;
import com.back.repository.TurnoDiaRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class TurnoDiaService {

	@Autowired
	private TurnoDiaRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<TurnoDia> listar() {
		List<TurnoDia> result = new ArrayList<TurnoDia>();
		rep.findAll().forEach(result::add);
		return result;
	}

	public TurnoDia guardar(TurnoDia turnodia) {
		Set<ConstraintViolation<TurnoDia>> violations = validator.validate(turnodia);
		String errorValidation = "";
		for (ConstraintViolation<TurnoDia> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(turnodia);
	}

	public void eliminar(Integer id) {
	    TurnoDia reg = buscarPorId(id);
	    rep.delete(reg); 
	}

	public TurnoDia buscarPorId(Integer id) {

		Optional<TurnoDia> turnodia = rep.findById(id);

		if (turnodia.isPresent()) {
			return turnodia.get();
		} else {
			throw new RuntimeException("No se encontro el detalle de venta con ID: " + id);
		}
	}
	
}
