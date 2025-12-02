package com.back.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.back.entity.Configuracion;
import com.back.service.ConfiguracionService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping(path = "/api/config")
public class ConfiguracionController {

	@Autowired
	ConfiguracionService serv;
	
	@GetMapping("list")
	public Map<String, Object> listar(
	        @RequestParam(required = false) Integer page,
	        @RequestParam(required = false) Integer size,
	        @RequestParam(required = false) String order,
	        @RequestParam(required = false) String filter,
	        @RequestParam(required = false) String detail
	) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		var data = serv.query(Configuracion.class, page, size, order, filter, detail);
	    
	    if (page == null || size == null) {
	        result.put("items", data.getContent());
	        return result;
	    }
	    
	    result.put("totalItems", data.getTotalElements());
	    result.put("itemsPerPage", size);
	    result.put("totalPages", data.getTotalPages());
	    result.put("currentPage", page);
	    result.put("items", data.getContent());
	    
	    return result;
	}
	
	@PostMapping(path = "save", consumes = "multipart/form-data")
	public Map<String, Object> guardar(@RequestParam(value = "configuracion") String configJson, 
								       @RequestParam(value = "imagen", required = false) MultipartFile imagenurl
	) throws Exception {
		Map<String, Object> result = new LinkedHashMap<>();
		
		ObjectMapper mapper = new ObjectMapper();
	    Configuracion config = mapper.readValue(configJson, Configuracion.class);
	    
	    if (imagenurl != null && !imagenurl.isEmpty()) {
	        String ruta = serv.guardarImagen(imagenurl);
	        config.setImagenurl(ruta);
	        config.setNombre(imagenurl.getOriginalFilename());
	        config.setTipo(imagenurl.getContentType());
	    }
		
		result.put("saved", serv.guardar(config));
		
		return result;
	}

	@PutMapping(path = "update/{id}", consumes = "multipart/form-data")
	public Map<String, Object> modificar(@PathVariable Integer id,
										 @RequestParam(value = "configuracion") String configJson, 
										 @RequestParam(value = "imagen", required = false) MultipartFile imagenurl,
									     @RequestParam(value = "imagenAnterior", required = false) String imagenAnt
	) throws Exception {
		Map<String, Object> result = new LinkedHashMap<>();
		
		Configuracion exist = serv.buscarPorId(id);
		if (exist == null) {
	        result.put("message", "Registro de ID " + id + " no existe.");
	        return result;
	    }
		
		ObjectMapper mapper = new ObjectMapper();
	    Configuracion config = mapper.readValue(configJson, Configuracion.class);
	    config.setId(id);
	    
	    
	    if (imagenurl != null && !imagenurl.isEmpty() && imagenAnt != null && !imagenAnt.isEmpty()) {
	        serv.eliminarImagen(imagenAnt);
	    }
	    
	    if (imagenurl != null && !imagenurl.isEmpty()) {
	        String ruta = serv.guardarImagen(imagenurl);
	        config.setImagenurl(ruta);
	        config.setNombre(imagenurl.getOriginalFilename());
	        config.setTipo(imagenurl.getContentType());
	    } else {
	        config.setImagenurl(exist.getImagenurl());
	        config.setNombre(exist.getNombre());
	        config.setTipo(exist.getTipo());
	    }

	    result.put("updated", serv.guardar(config));

		return result;
	}
	
	@DeleteMapping("deleteImage/{id}")
	public Map<String, Object> eliminarImagen(@PathVariable Integer id) throws Exception {
	    Map<String, Object> result = new LinkedHashMap<>();

	    Configuracion config = serv.buscarPorId(id);
	    if (config == null) {
	    	result.put("message", "Registro de ID " + id + " no existe.");
	        return result;
	    }

	    if (config.getImagenurl() != null && !config.getImagenurl().isEmpty()) {
	        serv.eliminarImagen(config.getImagenurl());
	        config.setImagenurl(null);
	        config.setNombre(null);
	        config.setTipo(null);
	        serv.guardar(config);
	    }

	    result.put("deleted", true);
	    return result;
	}
	
}
