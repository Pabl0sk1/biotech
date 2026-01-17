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
import com.back.entity.GrupoProducto;
import com.back.entity.Moneda;
import com.back.entity.SubgrupoProducto;
import com.back.entity.Tributacion;
import com.back.repository.GrupoProductoRepository;
import com.back.repository.MonedaRepository;
import com.back.repository.SubgrupoProductoRepository;
import com.back.repository.TributacionRepository;
import jakarta.annotation.PostConstruct;

@Service
public class GrupoProductoService {

	@Autowired
	GrupoProductoRepository rep;
	
	@Autowired
	SubgrupoProductoRepository repSubgrupoProducto;
	
	@Autowired
	MonedaRepository repMoneda;
	
	@Autowired
	TributacionRepository repTributacion;
	
	private final RestQueryErp rest;
	
	public GrupoProductoService(RestQueryErp rest) {
        this.rest = rest;
    }

	private final Map<String, JpaSpecificationExecutor<?>> detailRegistry = new HashMap<>();
	
	@PostConstruct
    public void init() {
		detailRegistry.put("subgroups", repSubgrupoProducto);
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
        throw new RuntimeException("Grupo de producto no soportado");
    }

	public GrupoProducto guardar(GrupoProducto grupoproducto) {
		return rep.save(grupoproducto);
	}

	public void eliminar(Integer id) {
		rep.deleteById(id);
	}
	
	public void eliminarSubgrupo(Integer id) {
		repSubgrupoProducto.deleteById(id);
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
		
		Optional<SubgrupoProducto> subgrupo = repSubgrupoProducto.findById(id);
		
		if (subgrupo.isPresent()) {
			return subgrupo.get();
		} else {
			throw new RuntimeException("No se encontro el subgrupo con ID: " + id);
		}

	}
	
	public void actualizarErp() {
		List<Map<String, Object>> dataListGrupo = rest.fetchAll("OB32", "", "", "");
		
		for (Map<String, Object> item : dataListGrupo) {
			
			try {
		        Integer erpId = (Integer) item.get("id");
		        Integer monedaId = (Integer) item.get("Moneda_id");
		        Integer tributacionId = (Integer) item.get("Tributacion_id");
		        String descripcion = (String) item.get("Descripcion_cb");
		        
		        Moneda moneda = null;
		        if (monedaId != null) moneda = repMoneda.findByErpid(monedaId).orElse(null);
		        
		        Tributacion tributacion = null;
		        if (tributacionId != null) tributacion = repTributacion.findByErpid(tributacionId).orElse(null);
		        
		        GrupoProducto data = rep.findByErpid(erpId).orElse(new GrupoProducto());
		        data.setErpid(erpId);
		        data.setMoneda(moneda);
		        data.setTributacion(tributacion);
		        data.setGrupoproducto(descripcion);
		        
		        rep.save(data);
		        
			} catch (Exception e) {
		        System.err.println("Error procesando item: " + item);
		        e.printStackTrace();
		    }
	    }
		
		List<Map<String, Object>> dataListSubgrupo = rest.fetchAll("OB32", "", "", "Producto_subgrupo");
		
		for (Map<String, Object> item : dataListSubgrupo) {
			
			try {
		        Integer erpId = (Integer) item.get("id");
		        Integer grupoId = (Integer) item.get("Producto_grupo_id");
		        String descripcion = (String) item.get("Descripcion");
		        
		        GrupoProducto grupoproducto = null;
		        if (grupoId != null) grupoproducto = rep.findByErpid(grupoId).orElse(null);
		        
		        SubgrupoProducto data = repSubgrupoProducto.findByErpid(erpId).orElse(new SubgrupoProducto());
		        data.setErpid(erpId);
		        data.setGrupoproducto(grupoproducto);
		        data.setSubgrupoproducto(descripcion);
		        
		        repSubgrupoProducto.save(data);
		        
			} catch (Exception e) {
		        System.err.println("Error procesando item: " + item);
		        e.printStackTrace();
		    }
	    }
		
	}
	
}
