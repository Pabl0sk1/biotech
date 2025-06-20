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

import com.asist.entity.TipoUsuario;
import com.asist.repository.TipoUsuarioRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class TipoUsuarioService {

	@Autowired
	TipoUsuarioRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<TipoUsuario> listar() {
		List<TipoUsuario> result = new ArrayList<TipoUsuario>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<TipoUsuario> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public TipoUsuario guardar(TipoUsuario tipousuario) {
		Set<ConstraintViolation<TipoUsuario>> violations = validator.validate(tipousuario);
		String errorValidation = "";
		for (ConstraintViolation<TipoUsuario> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(tipousuario);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public TipoUsuario buscarPorId(Integer id) {

		Optional<TipoUsuario> tipousuario = rep.findById(id);

		if (tipousuario.isPresent()) {
			return tipousuario.get();
		} else {
			throw new RuntimeException("No se encontro el tipo de usuario con ID: " + id);
		}

	}
	
	public Page<TipoUsuario> BuscarPorTipoUsuario(String tipousuario, Pageable pageable){
		return rep.findByTipousuarioLikeIgnoreCase(tipousuario, pageable);
	}

}
