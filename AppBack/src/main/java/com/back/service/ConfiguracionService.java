package com.back.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.back.config.SpecificationBuilder;
import com.back.entity.Configuracion;
import com.back.repository.ConfiguracionRepository;
import jakarta.annotation.PostConstruct;

@Service
public class ConfiguracionService {

	@Autowired
	ConfiguracionRepository rep;
	
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
        if (entity.equals(Configuracion.class)) {
            return (JpaSpecificationExecutor<T>) rep;
        }
        throw new RuntimeException("Entidad no soportada");
    }
	
	public Configuracion guardar(Configuracion config) {
		return rep.save(config);
	}

	public Configuracion buscarPorId(Integer id) {
		
		Optional<Configuracion> config = rep.findById(id);

		if (config.isPresent()) {
			return config.get();
		} else {
			throw new RuntimeException("No se encontro la configuración con ID: " + id);
		}
		
	}
	
	public String guardarImagen(MultipartFile archivo) throws Exception {
	    String folder = "uploads/logo/";
	    File dir = new File(folder);
	    if (!dir.exists()) dir.mkdirs();

	    String filename = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
	    Path path = Paths.get(folder + filename);

	    Files.write(path, archivo.getBytes());

	    return "/logo/" + filename;
	}
	
	public void eliminarImagen(String ruta) throws Exception {
	    Path path = Paths.get("uploads" + ruta);
	    Files.deleteIfExists(path);
	}
	
}
