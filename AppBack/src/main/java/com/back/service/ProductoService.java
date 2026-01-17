package com.back.service;

import java.util.ArrayList;
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
import com.back.entity.Entidad;
import com.back.entity.FaseCultivo;
import com.back.entity.NombreComercial;
import com.back.entity.PrincipioActivo;
import com.back.entity.Producto;
import com.back.entity.TipoProducto;
import com.back.repository.EntidadRepository;
import com.back.repository.FaseCultivoRepository;
import com.back.repository.NombreComercialRepository;
import com.back.repository.PrincipioActivoRepository;
import com.back.repository.ProductoRepository;
import com.back.repository.TipoProductoRepository;
import jakarta.annotation.PostConstruct;

@Service
public class ProductoService {

	@Autowired
	ProductoRepository rep;
	
	@Autowired
	EntidadRepository repEntidad;
	
	@Autowired
	NombreComercialRepository repNombrecomercial;
	
	@Autowired
	PrincipioActivoRepository repPrincipioactivo;
	
	@Autowired
	FaseCultivoRepository repFasecultivo;
	
	@Autowired
	TipoProductoRepository repTipoproducto;
	
	private final RestQueryErp rest;

	public ProductoService(RestQueryErp rest) {
        this.rest = rest;
    }

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
        if (entity.equals(Producto.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Producto no soportado");
    }

	public Producto guardar(Producto producto) {
		return rep.save(producto);
	}

	public void eliminar(Integer id) {
		rep.deleteById(id);
	}

	public Producto buscarPorId(Integer id) {

		Optional<Producto> producto = rep.findById(id);

		if (producto.isPresent()) {
			return producto.get();
		} else {
			throw new RuntimeException("No se encontro el producto con ID: " + id);
		}

	}
	
	public void actualizarErp() {
		List<String> recpro = new ArrayList<String>(List.of("BP41", "BP51", "BP52", "BP61", "BP64"));
		
		for (String r : recpro) {
			List<Map<String, Object>> dataList = rest.fetchAll(r, "", "", "");
			
			for (Map<String, Object> item : dataList) {
				List<Map<String, Object>> precios = null;
				
				try {
			        Integer erpId = (Integer) item.get("id");
			        Integer proveedorId = 0;
			        Integer nombrecomercialId = (Integer) item.get("Nombre_comercial_id");
			        Integer principioactivoId = (Integer) item.get("Principio_activo_id");
			        Integer fasecultivoId = (Integer) item.get("Fase_cultivo_id");
			        Double dosisporhec = (Double) item.get("Dosis");
			        Double costogerencial = (Double) item.get("Costo_gerencial_ro");
			        String estado = (String) item.get("Producto_status");
			        Boolean activo = "Activo".equalsIgnoreCase(estado);
			        Double precio = null;
			        
			        Entidad proveedor = null;
			        if (r.equals("BP51")) {
			        	proveedorId = (Integer) item.get("Proveedor_id");
			        	if (proveedorId != null) proveedor = repEntidad.findByErpid(proveedorId).orElse(null);
			        }
			        
			        if (r.equals("BP51") || r.equals("BP61") || r.equals("BP64")) {
			        	precios = rest.fetchAll("BP51", "Producto_id", erpId.toString(), "Precio");
			        	if (!precios.isEmpty()) precio = rest.parseDouble(precios.getFirst().get("P_normal"));
			        }
			        
			        NombreComercial nombrecomercial = null;
			        if (nombrecomercialId != null) nombrecomercial = repNombrecomercial.findByErpid(nombrecomercialId).orElse(null);
			        
			        PrincipioActivo principioactivo = null;
			        if (principioactivoId != null) principioactivo = repPrincipioactivo.findByErpid(principioactivoId).orElse(null);
			        
			        FaseCultivo fasecultivo = null;
			        if (fasecultivoId != null) fasecultivo = repFasecultivo.findByErpid(fasecultivoId).orElse(null);
			        
			        TipoProducto tipoproducto = null;
			        tipoproducto = repTipoproducto.findByRecurso(r);
			        
			        Producto data = rep.findByErpid(erpId).orElse(new Producto());
			        data.setErpid(erpId);
			        data.setEntidad(proveedor);
			        data.setNombrecomercial(nombrecomercial);
			        data.setPrincipioactivo(principioactivo);
			        data.setFasecultivo(fasecultivo);
			        data.setTipoproducto(tipoproducto);
			        data.setDosisporhec(dosisporhec);
			        data.setEstado(estado);
			        data.setActivo(activo);
			        data.setCostogerencial(costogerencial);
			        data.setPrecio(precio);
			        
			        rep.save(data);
			        
				} catch (Exception e) {
			        System.err.println("Error procesando item: " + item);
			        e.printStackTrace();
			    }
		    }
			
		}
		
	}
	
}
