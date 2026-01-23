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
import com.back.entity.Comision;
import com.back.entity.ComisionZafra;
import com.back.entity.Entidad;
import com.back.entity.GrupoProducto;
import com.back.entity.Producto;
import com.back.entity.SubgrupoProducto;
import com.back.repository.ComisionRepository;
import com.back.repository.ComisionZafraRepository;
import com.back.repository.EntidadRepository;
import com.back.repository.GrupoProductoRepository;
import com.back.repository.ProductoRepository;
import com.back.repository.SubgrupoProductoRepository;
import jakarta.annotation.PostConstruct;

@Service
public class ComisionService {
	
	@Autowired
	ComisionRepository rep;
	
	@Autowired
	EntidadRepository repEntidad;
	
	@Autowired
	GrupoProductoRepository repGrupo;
	
	@Autowired
	SubgrupoProductoRepository repSubgrupo;
	
	@Autowired
	ProductoRepository repProducto;
	
	@Autowired
	ComisionZafraRepository repD1;
	
	private final RestQueryErp rest;
	
	public ComisionService(RestQueryErp rest) {
        this.rest = rest;
    }

	private final Map<String, JpaSpecificationExecutor<?>> detailRegistry = new HashMap<>();
	
	@PostConstruct
    public void init() {
		detailRegistry.put("harvests", repD1);
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
    
	@SuppressWarnings({ "rawtypes", "unchecked", "null" })
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
        if (entity.equals(Comision.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Comision no soportada");
    }

	@SuppressWarnings("null")
	public Comision guardar(Comision comision) {
		return rep.save(comision);
	}

	@SuppressWarnings("null")
	public void eliminar(Integer id) {
		rep.deleteById(id);
	}
	
	@SuppressWarnings("null")
	public void eliminarZafra(Integer id) {
		repD1.deleteById(id);
	}

	@SuppressWarnings("null")
	public Comision buscarPorId(Integer id) {

		Optional<Comision> comision = rep.findById(id);

		if (comision.isPresent()) {
			return comision.get();
		} else {
			throw new RuntimeException("No se encontro la comision con ID: " + id);
		}

	}
	
	@SuppressWarnings("null")
	public ComisionZafra buscarPorIdZafra(Integer id) {
		
		Optional<ComisionZafra> zafra = repD1.findById(id);
		
		if (zafra.isPresent()) {
			return zafra.get();
		} else {
			throw new RuntimeException("No se encontro la zafra de la comision con ID: " + id);
		}

	}
	
	public void actualizarErp() {
		List<Map<String, Object>> dataList = rest.fetchAll("OA41", "", "", "");
		
		for (Map<String, Object> item : dataList) {
			
			try {
		        Integer erpId = (Integer) item.get("id");
		        Integer vendedorId = (Integer) item.get("Vendedor_id");
		        Integer grupoId = (Integer) item.get("Producto_grupo_id");
		        Integer subgrupoId = (Integer) item.get("Producto_subgrupo_id");
		        Integer productoId = (Integer) item.get("Producto_id");
		        String basecalculo = (String) item.get("Comision_base");
		        Double porcentaje = rest.parseDouble(item.get("Porcentage"));
		        
		        Entidad vendedor = null;
		        if (vendedorId != null) vendedor = repEntidad.findByErpid(vendedorId).orElse(null);
		        
		        GrupoProducto grupo = null;
		        if (grupoId != null) grupo = repGrupo.findByErpid(grupoId).orElse(null);
		        
		        SubgrupoProducto subgrupo = null;
		        if (subgrupoId != null) subgrupo = repSubgrupo.findByErpid(subgrupoId).orElse(null);
		        
		        Producto producto = null;
		        if (productoId != null) producto = repProducto.findByErpid(productoId).orElse(null);
		        
		        Comision data = rep.findByErpid(erpId).orElse(new Comision());
		        data.setErpid(erpId);
		        data.setEntidad(vendedor);
		        data.setGrupoproducto(grupo);
		        data.setSubgrupoproducto(subgrupo);
		        data.setProducto(producto);
		        data.setBasecalculo(basecalculo);
		        data.setPorcentaje(porcentaje);
		        
		        rep.save(data);
		        
			} catch (Exception e) {
		        System.err.println("Error procesando item: " + item);
		        e.printStackTrace();
		    }
	    }
		
	}

}
