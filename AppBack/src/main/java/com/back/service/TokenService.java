package com.back.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import com.back.config.SpecificationBuilder;
import com.back.entity.Token;
import com.back.repository.TokenRepository;
import jakarta.annotation.PostConstruct;

@Service
public class TokenService {
	
	@Autowired
	TokenRepository rep;
	
	private final Map<String, JpaSpecificationExecutor<?>> detailRegistry = new HashMap<>();
	
	@PostConstruct
    public void init() {
		//detailRegistry.put("campoDetalle", repositorioDetalle);
    }
	
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
    
	private Page<?> queryDetalle(String detail, String filterClause, Pageable pageable) {
	    JpaSpecificationExecutor<?> repo = detailRegistry.get(detail.toLowerCase());
	    
	    if (repo == null) {
	        throw new RuntimeException("Detalle no existente: " + detail);
	    }
	    
	    Specification spec = SpecificationBuilder.build(filterClause);
	    return repo.findAll(spec, pageable);
	}
    
    private <T> JpaSpecificationExecutor<T> getRepo(Class<T> entity) {
        if (entity.equals(Token.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Entidad no soportada");
    }

	public Token guardar(Token token) {
	    return rep.save(token);
	}

	public void eliminar(Integer id) {
		rep.deleteById(id);
	}

	public Token buscarPorId(Integer id) {

		Optional<Token> token = rep.findById(id);

		if (token.isPresent()) {
			return token.get();
		} else {
			throw new RuntimeException("No se encontro el token con ID: " + id);
		}

	}
	
	public void actualizarTokensExpirados() {
        LocalDate hoy = LocalDate.now();
        List<Token> exp = rep.findByFechaexpiracionBeforeAndEstadoNot(hoy, "Expirado");
        
        for (Token token : exp) {
            token.setEstado("Expirado");
            token.setActivo(false);
            rep.save(token);
        }
    }
	
	public Token buscarPorToken(String token) {
		return rep.findByToken(token);
	}

}
