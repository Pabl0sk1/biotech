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

import com.back.entity.Cargo;
import com.back.repository.CargoRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class CargoService {

	@Autowired
	CargoRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<Cargo> listar() {
		List<Cargo> result = new ArrayList<Cargo>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<Cargo> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public Cargo guardar(Cargo cargo) {
		Set<ConstraintViolation<Cargo>> violations = validator.validate(cargo);
		String errorValidation = "";
		for (ConstraintViolation<Cargo> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(cargo);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public Cargo buscarPorId(Integer id) {

		Optional<Cargo> cargo = rep.findById(id);

		if (cargo.isPresent()) {
			return cargo.get();
		} else {
			throw new RuntimeException("No se encontro el cargo con ID: " + id);
		}

	}
	
	public Page<Cargo> BuscarPorCargo(String cargo, Pageable pageable){
		return rep.findByCargoLikeIgnoreCase(cargo, pageable);
	}
	
}
