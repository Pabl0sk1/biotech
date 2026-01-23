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
import com.back.config.RestQueryErp;
import com.back.config.SpecificationBuilder;
import com.back.entity.Zafra;
import com.back.repository.ZafraRepository;
import jakarta.annotation.PostConstruct;

@Service
public class ZafraService {

	@Autowired
	ZafraRepository rep;
	
	private final RestQueryErp rest;
	
	public ZafraService(RestQueryErp rest) {
        this.rest = rest;
    }

	private final Map<String, JpaSpecificationExecutor<?>> detailRegistry = new HashMap<>();
	
	@PostConstruct
    public void init() {
		//detailRegistry.put("campoDetalle", repositorioDetalle);
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
        if (entity.equals(Zafra.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Zafra no soportada");
    }

	@SuppressWarnings("null")
	public Zafra guardar(Zafra zafra) {
		return rep.save(zafra);
	}

	@SuppressWarnings("null")
	public void eliminar(Integer id) {
		rep.deleteById(id);
	}

	@SuppressWarnings("null")
	public Zafra buscarPorId(Integer id) {

		Optional<Zafra> zafra = rep.findById(id);

		if (zafra.isPresent()) {
			return zafra.get();
		} else {
			throw new RuntimeException("No se encontro el zafra con ID: " + id);
		}

	}
	
	public void actualizarErp() {
		List<Map<String, Object>> dataList = rest.fetchAll("OA21", "", "", "");
		
		for (Map<String, Object> item : dataList) {
			
			try {
		        Integer erpId = (Integer) item.get("id");
		        String descripcion = (String) item.get("Descripcion_cb");
		        String cultura = (String) item.get("Cultura_txt");
		        LocalDate fechainicio = rest.parseDate(item.get("Fecha_inicio"));
		        LocalDate fechafin = rest.parseDate(item.get("Fecha_fin"));
		        
		        Zafra data = rep.findByErpid(erpId).orElse(new Zafra());
		        data.setErpid(erpId);
		        data.setDescripcion(descripcion);
		        data.setCultura(cultura);
		        data.setFechainicio(fechainicio);
		        data.setFechafin(fechafin);
	
		        rep.save(data);
		        
			} catch (Exception e) {
		        System.err.println("Error procesando item: " + item);
		        e.printStackTrace();
		    }
	    }
		
	}
	
}
