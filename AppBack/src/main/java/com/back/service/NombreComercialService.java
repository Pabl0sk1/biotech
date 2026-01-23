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
import com.back.entity.Medida;
import com.back.entity.NombreComercial;
import com.back.entity.SubgrupoProducto;
import com.back.repository.MedidaRepository;
import com.back.repository.NombreComercialRepository;
import com.back.repository.SubgrupoProductoRepository;
import jakarta.annotation.PostConstruct;

@Service
public class NombreComercialService {

	@Autowired
	NombreComercialRepository rep;
	
	@Autowired
	MedidaRepository repMedida;
	
	@Autowired
	SubgrupoProductoRepository repSubgrupo;
	
	private final RestQueryErp rest;
	
	public NombreComercialService(RestQueryErp rest) {
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
        if (entity.equals(NombreComercial.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Nombre comercial no soportado");
    }

	@SuppressWarnings("null")
	public NombreComercial guardar(NombreComercial nombrecomercial) {
		return rep.save(nombrecomercial);
	}

	@SuppressWarnings("null")
	public void eliminar(Integer id) {
		rep.deleteById(id);
	}

	@SuppressWarnings("null")
	public NombreComercial buscarPorId(Integer id) {

		Optional<NombreComercial> nombrecomercial = rep.findById(id);

		if (nombrecomercial.isPresent()) {
			return nombrecomercial.get();
		} else {
			throw new RuntimeException("No se encontro el nombre comercial con ID: " + id);
		}

	}
	
	public void actualizarErp() {
		List<Map<String, Object>> dataList = rest.fetchAll("OB10", "", "", "");
		
		for (Map<String, Object> item : dataList) {
			
			try {
		        Integer erpId = (Integer) item.get("id");
		        Integer medidaId = (Integer) item.get("Medida_id");
		        Integer subgrupoId = (Integer) item.get("Producto_subgrupo_id");
		        String descripcion = (String) item.get("Descripcion_cb");
		        
		        Medida medida = null;
		        if (medidaId != null) medida = repMedida.findByErpid(medidaId).orElse(null);
		        
		        SubgrupoProducto subgrupo = null;
		        if (subgrupoId != null) subgrupo = repSubgrupo.findByErpid(subgrupoId).orElse(null);
		        
		        NombreComercial data = rep.findByErpid(erpId).orElse(new NombreComercial());
		        data.setErpid(erpId);
		        data.setMedida(medida);
		        data.setSubgrupoproducto(subgrupo);
		        data.setNombrecomercial(descripcion);
		        
		        rep.save(data);
		        
			} catch (Exception e) {
		        System.err.println("Error procesando item: " + item);
		        e.printStackTrace();
		    }
	    }
		
	}
	
}
