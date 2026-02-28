package com.back.service;

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
import com.back.entity.Cartera;
import com.back.repository.CarteraRepository;
import jakarta.annotation.PostConstruct;

@Service
public class CarteraService {

	@Autowired
	CarteraRepository rep;
	
	private final RestQueryErp rest;
	
	public CarteraService(RestQueryErp rest) {
        this.rest = rest;
    }

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
        if (entity.equals(Cartera.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Cartera no soportada");
    }

	public Cartera guardar(Cartera cartera) {
		return rep.save(cartera);
	}

	public void eliminar(Integer id) {
		rep.deleteById(id);
	}

	public Cartera buscarPorId(Integer id) {

		Optional<Cartera> cartera = rep.findById(id);

		if (cartera.isPresent()) {
			return cartera.get();
		} else {
			throw new RuntimeException("No se encontro el cartera con ID: " + id);
		}

	}
	
	public void actualizarErp() {
		List<Map<String, Object>> dataList = rest.fetchAll("OE71", "", "", "");
		
		for (Map<String, Object> item : dataList) {
			
			try {
				Map<String, Object> dataName = rest.formatName(item.get("Vendedor_txt"));
				
		        Integer erpId = (Integer) item.get("id");
		        Integer vendedorId = (Integer) item.get("Vendedor_id");
		        String nombre = (String) dataName.get("nomape");
		        String region = (String) item.get("Region_txt");
		        
		        Cartera data = rep.findByErpid(erpId).orElse(new Cartera());
		        data.setErpid(erpId);
		        data.setEntidadid(vendedorId);
		        data.setNombre(nombre);
		        data.setRegion(region);
	
		        rep.save(data);
		        
			} catch (Exception e) {
		        System.err.println("Error procesando item: " + item);
		        e.printStackTrace();
		    }
	    }
		
	}
	
}
