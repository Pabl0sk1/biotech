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
import com.back.entity.Menu;
import com.back.entity.Programa;
import com.back.entity.Submenu;
import com.back.repository.MenuRepository;
import com.back.repository.ProgramaRepository;
import com.back.repository.SubmenuRepository;
import jakarta.annotation.PostConstruct;

@Service
public class MenuService {

	@Autowired
	MenuRepository rep;
	
	@Autowired
	SubmenuRepository repD1;
	
	@Autowired
	ProgramaRepository repD2;

	private final Map<String, JpaSpecificationExecutor<?>> detailRegistry = new HashMap<>();
	
	@PostConstruct
    public void init() {
		detailRegistry.put("submenus", repD1);
		detailRegistry.put("programs", repD2);
    }
	
	@SuppressWarnings({ "rawtypes", "null", "unchecked" })
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
    
	@SuppressWarnings({ "rawtypes", "null", "unchecked" })
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
        if (entity.equals(Menu.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Menu no soportado");
    }

	@SuppressWarnings("null")
	public Menu guardar(Menu menu) {
		return rep.save(menu);
	}

	@SuppressWarnings("null")
	public void eliminar(Integer id) {
		rep.deleteById(id);
	}
	
	@SuppressWarnings("null")
	public void eliminarSubmenu(Integer id) {
		repD1.deleteById(id);
	}
	
	@SuppressWarnings("null")
	public void eliminarPrograma(Integer id) {
		repD2.deleteById(id);
	}

	@SuppressWarnings("null")
	public Menu buscarPorId(Integer id) {

		Optional<Menu> menu = rep.findById(id);
		
		if (menu.isPresent()) {
			return menu.get();
		} else {
			throw new RuntimeException("No se encontro el menu con ID: " + id);
		}

	}
	
	@SuppressWarnings("null")
	public Submenu buscarPorIdSubmenu(Integer id) {
		
		Optional<Submenu> submenu = repD1.findById(id);
		
		if (submenu.isPresent()) {
			return submenu.get();
		} else {
			throw new RuntimeException("No se encontro el submenu con ID: " + id);
		}

	}
	
	@SuppressWarnings("null")
	public Programa buscarPorIdPrograma(Integer id) {
		
		Optional<Programa> programa = repD2.findById(id);
		
		if (programa.isPresent()) {
			return programa.get();
		} else {
			throw new RuntimeException("No se encontro el programa con ID: " + id);
		}

	}
	
}
