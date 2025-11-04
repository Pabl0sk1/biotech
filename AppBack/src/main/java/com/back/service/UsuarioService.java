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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.back.entity.Usuario;
import com.back.repository.UsuarioRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@Service
public class UsuarioService {

	@Autowired
	UsuarioRepository rep;
	
	@Autowired
	private JdbcTemplate jdbcTemplate;

	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();

	public List<Usuario> listar() {
		List<Usuario> result = new ArrayList<Usuario>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<Usuario> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public Usuario guardar(Usuario usuario) {
	    Set<ConstraintViolation<Usuario>> violations = validator.validate(usuario);
	    String errorValidation = "";
	    for (ConstraintViolation<Usuario> cv : violations) {
	        errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
	    }
	    if (!violations.isEmpty()) {
	        throw new RuntimeException(errorValidation);
	    }
	    
	    // Si es un nuevo usuario o se está actualizando la contraseña
	    if (usuario.getId() == null || !usuario.getContrasena().startsWith("$2a$")) {
	        // Encriptar la contraseña usando pgcrypto
	        String hashedPassword = jdbcTemplate.queryForObject(
	            "SELECT crypt(?, gen_salt('bf'))", 
	            String.class, 
	            usuario.getContrasena()
	        );
	        usuario.setContrasena(hashedPassword);
	    }
	    
	    return rep.save(usuario);
	}
	
	public boolean verificarContrasena(String nombreusuario, String contrasena) {
	    String sql = "SELECT COUNT(*) FROM usuarios WHERE nombreusuario = ? AND contrasena = crypt(?, contrasena)";
	    int count = jdbcTemplate.queryForObject(sql, Integer.class, nombreusuario, contrasena);
	    return count > 0;
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public Usuario buscarPorId(Integer id) {

		Optional<Usuario> usuario = rep.findById(id);

		if (usuario.isPresent()) {
			return usuario.get();
		} else {
			throw new RuntimeException("No se encontro el usuario con ID: " + id);
		}

	}
	
	public Page <Usuario> BuscarPorNombre(String nombreusuario, Pageable pageable) {
		return rep.findByNombreusuarioLikeIgnoreCase(nombreusuario, pageable);
	}
	
	public Usuario BuscarPorNombreUsuario(String nombreusuario) {
	    return rep.findByNombreusuario(nombreusuario).orElse(null);
	}

	public Page <Usuario> BuscarPorEstado(Character estado, Pageable pageable) {
		return rep.findByEstado(estado, pageable);
	}
	
	public Page<Usuario> BuscarPorIdRol(Integer id, Pageable pageable){
		return rep.findByIdRol(id, pageable);
	}
	
	public Page<Usuario> BuscarPorNombreYEstado(String nombreusuario, Character estado, Pageable pageable) {
	    return rep.findByNombreusuarioLikeIgnoreCaseAndEstado(nombreusuario, estado, pageable);
	}
	
	public Page<Usuario> BuscarPorIdRolYEstado(Integer id, Character estado, Pageable pageable) {
	    return rep.findByEstadoLikeIgnoreCaseAndIdRol(id, estado, pageable);
	}
	
	public Page<Usuario> BuscarPorNombreYIdRol(String nombreusuario, Integer id, Pageable pageable) {
	    return rep.findByNombreusuarioLikeIgnoreCaseAndIdRol(nombreusuario, id, pageable);
	}
	
	public Page<Usuario> BuscarPorNombreYIdRolYEstado(String nombreusuario, Integer id, Character estado, Pageable pageable) {
	    return rep.findByNombreusuarioLikeIgnoreCaseAndIdRolAndEstado(nombreusuario, id, estado, pageable);
	}
	
	public boolean verificarContrasena(Integer userId, String contrasena) {
	    String sql = "SELECT COUNT(*) FROM usuarios WHERE id = ? AND contrasena = crypt(?, contrasena)";
	    int count = jdbcTemplate.queryForObject(sql, Integer.class, userId, contrasena);
	    return count > 0;
	}

	public void actualizarContrasena(Integer userId, String nuevaContrasena) {
	    String hashedPassword = jdbcTemplate.queryForObject(
	        "SELECT crypt(?, gen_salt('bf'))", 
	        String.class, 
	        nuevaContrasena
	    );
	    
	    String sql = "UPDATE usuarios SET contrasena = ? WHERE id = ?";
	    jdbcTemplate.update(sql, hashedPassword, userId);
	}

}
