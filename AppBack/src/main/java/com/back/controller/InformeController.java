package com.back.controller;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.back.entity.Informe;
import com.back.entity.InformeData;
import com.back.service.InformeService;
import com.back.util.CompressionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping(path = "/api/report")
public class InformeController {
	
	@Autowired
	InformeService serv;

	@GetMapping("list")
	public Map<String, Object> listar(
	        @RequestParam(required = false) Integer page,
	        @RequestParam(required = false) Integer size,
	        @RequestParam(required = false) String order,
	        @RequestParam(required = false) String filter,
	        @RequestParam(required = false) String detail
	) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		var data = serv.query(Informe.class, page, size, order, filter, detail);
	    
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
	
	@GetMapping("data/{id}")
	public Map<String, Object> obtenerData(@PathVariable Integer id) throws Exception {
	    Map<String, Object> result = new LinkedHashMap<>();
	    
	    InformeData data = serv.buscarDataPorIdInforme(id).orElseThrow(() -> new RuntimeException("Data no encontrada"));
	    
	    byte[] decompressed = CompressionUtil.descomprimirJson(data.getData());
	    String json = new String(decompressed, StandardCharsets.UTF_8);

	    result.put("dataJson", json);
	    
	    return result;
	}
	
	@PostMapping(path = "saveData/{id}")
	public Map<String, Object> guardarData(@PathVariable Integer id, @RequestBody Map<String, Object> json) throws Exception {
		Map<String, Object> result = new LinkedHashMap<>();
		
	    Informe informe = serv.buscarPorId(id);
	    
	    String jsonString = new ObjectMapper().writeValueAsString(json.get("data"));
	    byte[] compressed = CompressionUtil.comprimirJson(jsonString.getBytes(StandardCharsets.UTF_8));
	    
	    InformeData data = serv.buscarDataPorIdInforme(id).orElse(new InformeData());
	    data.setInforme(informe);
	    data.setData(compressed);
	    
	    result.put("savedData", serv.guardarData(data));

	    return result;
	}

	@PostMapping(path = "save")
	public Map<String, Object> guardar(@RequestBody Informe informe) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		result.put("saved", serv.guardar(informe));
		
		return result;
	}

	@PutMapping(path = "update/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Informe informe) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		Informe exist = serv.buscarPorId(id);

		if (exist != null) {
			informe.setId(id);
			result.put("updated", serv.guardar(informe));
		} else {
			result.put("message", "Registro de ID " + id + " no existe.");
		}

		return result;
	}

	@DeleteMapping(path = "delete/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> result = new LinkedHashMap<>();
				
		Informe exist = serv.buscarPorId(id);

		if (exist != null) {
			serv.eliminar(id);
			result.put("deleted", exist);
		} else {
			result.put("message", "Registro de ID " + id + " no existe.");
		}

		return result;
	}
	
	@DeleteMapping(path = "deleteData/{id}")
	public Map<String, Object> eliminarData(@PathVariable Integer id) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		InformeData exist = serv.buscarDataPorIdInforme(id).get();
		
		if (exist != null) {
			serv.eliminarData(exist.getId());
			result.put("deleted", exist);
		} else {
			result.put("message", "Registro de ID " + id + " no existe.");
		}

		return result;
	}

}
