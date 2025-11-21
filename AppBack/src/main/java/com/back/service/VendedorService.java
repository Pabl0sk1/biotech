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
import com.back.entity.Vendedor;
import com.back.repository.VendedorRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class VendedorService {

	@Autowired
	VendedorRepository rep;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<Vendedor> listar() {
		List<Vendedor> result = new ArrayList<Vendedor>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<Vendedor> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public Vendedor guardar(Vendedor vendedor) {
		Set<ConstraintViolation<Vendedor>> violations = validator.validate(vendedor);
		String errorValidation = "";
		for (ConstraintViolation<Vendedor> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(vendedor);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public Vendedor buscarPorId(Integer id) {

		Optional<Vendedor> Vendedor = rep.findById(id);

		if (Vendedor.isPresent()) {
			return Vendedor.get();
		} else {
			throw new RuntimeException("No se encontro el Vendedor con ID: " + id);
		}

	}
	
	public Page<Vendedor> BuscarPorNrodoc(String nrodoc, Pageable pageable){
		return rep.findByNrodocLikeIgnoreCase(nrodoc, pageable);
	}
	
	public Page<Vendedor> BuscarPorNombre(String nombre, Pageable pageable){
		return rep.findByNomapeLikeIgnoreCase(nombre.replace(",", ""), pageable);
	}
	
	public Page<Vendedor> BuscarPorNrodocYNombre(String nrodoc, String nombre, Pageable pageable){
		return rep.findByNrodocLikeIgnoreCaseAndNomapeLikeIgnoreCase(nrodoc, nombre.replace(",", ""), pageable);
	}
	
	public List<Vendedor> BuscarPorNombreONrodoc(String nombre, String nrodoc){
		return rep.findByNomapeLikeIgnoreCaseOrNrodocLike(nombre.replace(",", ""), nrodoc);
	}

}
