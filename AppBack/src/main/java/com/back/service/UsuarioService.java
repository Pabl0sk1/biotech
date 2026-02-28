package com.back.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.back.config.SpecificationBuilder;
import com.back.entity.Usuario;
import com.back.repository.UsuarioRepository;
import jakarta.annotation.PostConstruct;

@Service
public class UsuarioService {

	@Autowired
	UsuarioRepository rep;
	
	@Autowired
	private JdbcTemplate jdbcTemplate;
	
	private final Map<String, JpaSpecificationExecutor<?>> detailRegistry = new HashMap<>();
	
	@PostConstruct
    public void init() {
		//detailRegistry.put("campoDetalle", repositorioDetalle);
    }
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Page<?> query(Class<?> entity, Integer page, Integer size, String orderClause, String filterClause, String detail) {
		Pageable pageable = getPageable(page, size, orderClause);
		
        if (detail != null && !detail.isBlank()) {
            return this.queryDetalle(detail, filterClause, pageable);
        }

        JpaSpecificationExecutor<?> repo = getRepo(entity);
        Specification spec = SpecificationBuilder.build(filterClause);
        
        return repo.findAll(spec, pageable);
    }

	private Pageable getPageable(Integer page, Integer size, String order) {
	    Sort sort;

	    if (order != null && !order.isBlank()) {
	        String[] orders = order.split(";");
	        sort = Sort.unsorted();
	        for (String o : orders) {
	            String[] p = o.split(",");
	            sort = sort.and(Sort.by(
	                    p[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
	                    p[0]
	            ));
	        }
	    } else {
	        sort = Sort.by(Sort.Direction.DESC, "id");
	    }

	    if (page == null || size == null) {
	        return PageRequest.of(0, Integer.MAX_VALUE, sort);
	    }

	    return PageRequest.of(page, size, sort);
	}
    
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private Page<?> queryDetalle(String detail, String filterClause, Pageable pageable) {
	    JpaSpecificationExecutor<?> repo = detailRegistry.get(detail.toLowerCase());
	    
	    if (repo == null) {
	        throw new RuntimeException("Detalle no existente: " + detail);
	    }
	    
	    Specification spec = SpecificationBuilder.build(filterClause);
	    return repo.findAll(spec, pageable);
	}
    
    @SuppressWarnings("unchecked")
	private <T> JpaSpecificationExecutor<T> getRepo(Class<T> entity) {
        if (entity.equals(Usuario.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Usuario no soportado");
    }

	public Usuario guardar(Usuario usuario) {
	    
	    if (usuario.getId() == null || !usuario.getContrasena().startsWith("$2a$")) {
	        String hashedPassword = jdbcTemplate.queryForObject(
	            "SELECT crypt(?, gen_salt('bf'))", 
	            String.class, 
	            usuario.getContrasena()
	        );
	        usuario.setContrasena(hashedPassword);
	    }
	    
	    return rep.save(usuario);
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
	
	public Usuario buscarPorNombreUsuario(String nombreusuario) {
	    return rep.findByNombreusuario(nombreusuario).orElse(null);
	}
	
	public boolean verificarContrasena(String nombreusuario, String contrasena) {
	    String sql = "SELECT COUNT(*) FROM usuarios WHERE nombreusuario = ? AND contrasena = crypt(?, contrasena)";
	    int count = jdbcTemplate.queryForObject(sql, Integer.class, nombreusuario, contrasena);
	    return count > 0;
	}
	
	public boolean verificarContrasenaID(Integer userId, String contrasena) {
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
