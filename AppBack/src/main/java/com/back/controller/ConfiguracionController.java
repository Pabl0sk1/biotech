package com.back.controller;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.back.entity.Configuracion;
import com.back.entity.ConfiguracionResponse;
import com.back.service.ConfiguracionService;
import com.back.util.ImageUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping(path = "/api/configuracion")
public class ConfiguracionController {

	@Autowired
	ConfiguracionService serv;
	
	private ConfiguracionResponse mapToConfigResponse(Configuracion config) {
        return new ConfiguracionResponse(
        		config.getId(),
        		config.getEntidad(),
                config.getNrotelefono(),
                config.getCorreo(),
                config.getColorpri(),
                config.getColorsec(),
                config.getColorter(),
                config.getNombre(),
                config.getTipo(),
                config.getBase64imagen()
        );
	}
	
	@GetMapping(path = "listar")
	public Map<String, Object> listar() {
		Map<String, Object> result = new HashMap<>();

		result.put("ok", true);
		result.put("size", serv.listar().size());
		result.put("list", serv.listar());

		return result;
	}
	
	@GetMapping(path = "listarPaginado")
	 public ResponseEntity<Map<String, Object>> listarPaginado(
	         @RequestParam(defaultValue = "0") int page,
	         @RequestParam(defaultValue = "10") int size,
	         @RequestParam(defaultValue = "id") String sortBy,
	         @RequestParam(defaultValue = "false") boolean sortType) {

	     Map<String, Object> result = new HashMap<>();
	     Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	     Pageable pageable = PageRequest.of(page, size, sort);

	     try {
	         Page<Configuracion> cfg = serv.listarTodos(pageable); // Usa listarTodos en lugar de listarPaginado
	         List<ConfiguracionResponse> configResp = cfg.getContent().stream()
	                 .map(this::mapToConfigResponse)
	                 .collect(Collectors.toList());
	         
	         result.put("ok", true);
	         result.put("size", cfg.getTotalElements());
	         result.put("list", configResp);
	         result.put("totalPages", cfg.getTotalPages());

	         return ResponseEntity.ok(result);
	     } catch (Exception e) {
	         result.put("ok", false);
	         result.put("error", "Error al obtener la configuración: " + e.getMessage());
	         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
	     }
	 }
	
	@GetMapping(path = "configImagen")
	 public ResponseEntity<List<ConfiguracionResponse>> getAllConfig() {
	     Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by("id"));
	     Page<Configuracion> cfg = serv.listarTodos(pageable);

	     // Verifica si productos.getContent() no es nulo antes de usar stream
	     List<ConfiguracionResponse> response = cfg.getContent() != null ? cfg.getContent().stream()
	             .map(this::mapToConfigResponse)
	             .collect(Collectors.toList()) : Collections.emptyList();

	     return ResponseEntity.ok(response);
	 }
	
	@GetMapping(path = "buscarPorId/{id}")
	public Map<String, Object> buscarPorId(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();

		map.put("ok", true);
		map.put("list", serv.buscarPorId(id));

		return map;
	}
	
	@PostMapping(path = "guardar")
	public ResponseEntity<?> guardar(@RequestParam(name = "configuracion") String configJson, 
	                                  @RequestParam(required = false) MultipartFile imagen) {
	    try {
	        // Deserializa el JSON a un objeto Producto
	        Configuracion cfg = new ObjectMapper().readValue(configJson, Configuracion.class);
	        
	        // Convierte la imagen a un arreglo de bytes
	        if (imagen != null && !imagen.isEmpty()) {
	        	byte[] imageBytes = imagen.getBytes();
                byte[] compressedImage = ImageUtils.compressImage(imageBytes);
                
                cfg.setImagen(compressedImage);
	        	cfg.setNombre(imagen.getOriginalFilename());
                cfg.setTipo(imagen.getContentType().substring(6));
	        } else {
	        	cfg.setImagen(null);
	        	cfg.setNombre("");
	        	cfg.setTipo("");
	        }	        
	        
	        // Llama al servicio para guardar el producto
	        Configuracion cfgGuardado = serv.guardar(cfg);

	        // Crea un ProductoResponse
	        ConfiguracionResponse configResp = new ConfiguracionResponse();
	        configResp.setId(cfgGuardado.getId());
	        configResp.setEntidad(cfgGuardado.getEntidad());
	        configResp.setNrotelefono(cfgGuardado.getNrotelefono());
	        configResp.setCorreo(cfgGuardado.getCorreo());
	        configResp.setColorpri(cfgGuardado.getColorpri());
	        configResp.setColorsec(cfgGuardado.getColorsec());
	        configResp.setColorter(cfgGuardado.getColorter());
	        configResp.setNombre(cfgGuardado.getNombre());
	        configResp.setTipo(cfgGuardado.getTipo());
	        configResp.setBase64imagen(cfgGuardado.getBase64imagen());

	        // Construye la respuesta
	        return ResponseEntity.status(HttpStatus.CREATED).body(configResp); 
	    } catch (Exception e) {
	        // Manejo de errores
	        return ResponseEntity.badRequest().body("Error al guardar la configuración: " + e.getMessage());
	    }
	}
	
	@PutMapping(path = "modificar/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id,
	                                     @RequestParam(name = "configuracion") String configJson,
	                                     @RequestParam(required = false) MultipartFile imagen) {
	    Map<String, Object> map = new HashMap<>();
	    map.put("ok", true);
	    
	    try {
	        // Obtener el producto existente
	        Configuracion cfg = serv.buscarPorId(id);

	        if (cfg == null) {
	            map.put("ok", false);
	            map.put("message", "Registro de ID " + id + " no existe.");
	            return map;
	        }

	        // Deserializar el nuevo producto
	        Configuracion config = new ObjectMapper().readValue(configJson, Configuracion.class);
	        config.setId(id);

	        // Mantener la imagen existente si no se proporciona una nueva
	        if (imagen != null && !imagen.isEmpty()) {
	            try {
	                byte[] imageBytes = imagen.getBytes();
	                byte[] compressedImage = ImageUtils.compressImage(imageBytes);
	                
	                config.setImagen(compressedImage);
	                config.setNombre(imagen.getOriginalFilename());
	                config.setTipo(imagen.getContentType().substring(6));
	            } catch (IOException e) {
	                map.put("ok", false);
	                map.put("message", "Error al procesar la nueva imagen: " + e.getMessage());
	                return map;
	            }
	        } else {
	            // Mantener la imagen existente
	        	config.setImagen(null);
	        	config.setNombre("");
	        	config.setTipo("");
	        }

	        // Guardar el producto actualizado
	        Configuracion configMod = serv.guardar(config);
	        map.put("modified", configMod);

	    } catch (Exception e) {
	        map.put("ok", false);
	        map.put("message", "Error al modificar la configuración: " + e.getMessage());
	        e.printStackTrace();
	    }

	    return map;
	}
	
}
