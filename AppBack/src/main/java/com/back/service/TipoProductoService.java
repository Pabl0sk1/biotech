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
import org.springframework.stereotype.Service;
import com.back.config.SpecificationBuilder;
import com.back.entity.TipoProducto;
import com.back.repository.TipoProductoRepository;
import jakarta.annotation.PostConstruct;

@Service
public class TipoProductoService {

	@Autowired
	TipoProductoRepository rep;

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
        if (entity.equals(TipoProducto.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Tipo de producto no soportado");
    }

	public TipoProducto guardar(TipoProducto tipoproducto) {
		return rep.save(tipoproducto);
	}

	public void eliminar(Integer id) {
		rep.deleteById(id);
	}

	public TipoProducto buscarPorId(Integer id) {

		Optional<TipoProducto> tipoproducto = rep.findById(id);

		if (tipoproducto.isPresent()) {
			return tipoproducto.get();
		} else {
			throw new RuntimeException("No se encontro el tipo de producto con ID: " + id);
		}

	}
	
}
