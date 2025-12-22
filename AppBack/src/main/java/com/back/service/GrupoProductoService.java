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
import com.back.entity.GrupoProducto;
import com.back.entity.SubgrupoProducto;
import com.back.repository.GrupoProductoRepository;
import com.back.repository.SubgrupoProductoRepository;
import jakarta.annotation.PostConstruct;

@Service
public class GrupoProductoService {

	@Autowired
	GrupoProductoRepository rep;
	
	@Autowired
	SubgrupoProductoRepository repD1;

	private final Map<String, JpaSpecificationExecutor<?>> detailRegistry = new HashMap<>();
	
	@PostConstruct
    public void init() {
		detailRegistry.put("subgroups", repD1);
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
        if (entity.equals(GrupoProducto.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Entidad no soportada");
    }

	public GrupoProducto guardar(GrupoProducto grupoproducto) {
		return rep.save(grupoproducto);
	}

	public void eliminar(Integer id) {
		rep.deleteById(id);
	}
	
	public void eliminarSubgrupo(Integer id) {
		repD1.deleteById(id);
	}

	public GrupoProducto buscarPorId(Integer id) {

		Optional<GrupoProducto> grupoproducto = rep.findById(id);

		if (grupoproducto.isPresent()) {
			return grupoproducto.get();
		} else {
			throw new RuntimeException("No se encontro el grupo de producto con ID: " + id);
		}

	}
	
	public SubgrupoProducto buscarPorIdSubgrupo(Integer id) {
		
		Optional<SubgrupoProducto> subgrupo = repD1.findById(id);
		
		if (subgrupo.isPresent()) {
			return subgrupo.get();
		} else {
			throw new RuntimeException("No se encontro el subgrupo con ID: " + id);
		}

	}
	
}
