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
import com.back.entity.Cargo;
import com.back.entity.Cartera;
import com.back.entity.Entidad;
import com.back.entity.Sucursal;
import com.back.repository.CargoRepository;
import com.back.repository.CarteraRepository;
import com.back.repository.EntidadRepository;
import com.back.repository.SucursalRepository;
import jakarta.annotation.PostConstruct;

@Service
public class EntidadService {

	@Autowired
	EntidadRepository rep;
	
	@Autowired
	SucursalRepository repSucursal;
	
	@Autowired
	CargoRepository repCargo;
	
	@Autowired
	CarteraRepository repCartera;
	
	private final RestQueryErp rest;
	
	public EntidadService(RestQueryErp rest) {
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
        if (entity.equals(Entidad.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Entidad no soportada");
    }

	@SuppressWarnings("null")
	public Entidad guardar(Entidad entidad) {
		return rep.save(entidad);
	}

	@SuppressWarnings("null")
	public void eliminar(Integer id) {
		rep.deleteById(id);
	}

	@SuppressWarnings("null")
	public Entidad buscarPorId(Integer id) {

		Optional<Entidad> entidad = rep.findById(id);

		if (entidad.isPresent()) {
			return entidad.get();
		} else {
			throw new RuntimeException("No se encontro la entidad con ID: " + id);
		}

	}
	
	public void actualizarErp() {
		List<Map<String, Object>> dataList = rest.fetchAll("BA31", "", "", "");
		
		for (Map<String, Object> item : dataList) {
			
			try {
		        Map<String, Object> contrato = null;
		        Map<String, Object> dataName = rest.formatName(item.get("Descripcion_cb"));
		        
		        Integer erpId = (Integer) item.get("id");
		        Integer sucursalId = (Integer) item.get("Und_reg_id");
		        Integer carteraId = (Integer) item.get("Cartera_id");
		        String categorias = (String) item.get("Entidad_tipo");
		        String nomape = (String) dataName.get("nomape");
		        String nombre = (String) dataName.get("nombre");
		        String apellido = (String) dataName.get("apellido");
		        String nrodoc = (String) item.get("CI_uk");
		        String estado = (String) item.get("Entidad_status");
		        Boolean activo = "Activo".equalsIgnoreCase(estado);
		        LocalDate fechanacimiento = rest.parseDate(item.get("Fecha_nacimiento"));
		        LocalDate fechainicio = rest.parseDate(item.get("Fecha_inicio"));
		        LocalDate fechafin = null;
		        Double salario = null;
		        
		        Cargo cargo = null;
		        if (categorias != null && categorias.contains("Funcionario")) {
		        	contrato = rest.fetchAll("AR05", "Entidad_id", erpId.toString(), "").getFirst();
		        	salario = rest.parseDouble(contrato.get("Salario"));
		        	fechafin = rest.parseDate(contrato.get("Fecha_caducidad"));
		        	
		        	Integer cargoId = (Integer) contrato.get("Cargo_id");
		        	if (cargoId != null) cargo = repCargo.findByErpid(cargoId).orElse(null);
		        }
		        
		        Sucursal sucursal = null;
		        if (sucursalId != null) sucursal = repSucursal.findByErpid(sucursalId).orElse(null);
		        
		        Cartera cartera = null;
		        if (carteraId != null) cartera = repCartera.findByErpid(carteraId).orElse(null);
		        
		        Entidad data = rep.findByErpid(erpId).orElse(new Entidad());
		        data.setErpid(erpId);
		        data.setCargo(cargo);
		        data.setSucursal(sucursal);
		        data.setCartera(cartera);
		        data.setCategorias(categorias);
		        data.setNomape(nomape);
		        data.setNombre(nombre);
		        data.setApellido(apellido);
		        data.setNrodoc(nrodoc);
		        data.setFechanacimiento(fechanacimiento);
		        data.setFechainicio(fechainicio);
		        data.setFechafin(fechafin);
		        data.setSalario(salario);
		        data.setEstado(estado);
		        data.setActivo(activo);
		        data.setCodzktime(null);
				data.setNrotelefono(null);
		        data.setCorreo(null);
		        
		        rep.save(data);
		        
			} catch (Exception e) {
		        System.err.println("Error procesando item: " + item);
		        e.printStackTrace();
		    }
	    }
		
	}
	
}
