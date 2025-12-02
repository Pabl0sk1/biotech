package com.back.controller;

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
import com.back.entity.Cargo;
import com.back.service.CargoService;

@RestController
@RequestMapping(path = "/api/position")
public class CargoController {
	
	@Autowired
	CargoService serv;

	@GetMapping("list")
	public Map<String, Object> listar(
	        @RequestParam(required = false) Integer page,
	        @RequestParam(required = false) Integer size,
	        @RequestParam(required = false) String order,
	        @RequestParam(required = false) String filter,
	        @RequestParam(required = false) String detail
	) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		var data = serv.query(Cargo.class, page, size, order, filter, detail);
	    
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

	@PostMapping(path = "save")
	public Map<String, Object> guardar(@RequestBody Cargo cargo) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		result.put("saved", serv.guardar(cargo));
		
		return result;
	}

	@PutMapping(path = "update/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Cargo cargo) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		Cargo exist = serv.buscarPorId(id);

		if (exist != null) {
			cargo.setId(id);
			result.put("updated", serv.guardar(cargo));
		} else {
			result.put("message", "Registro de ID " + id + " no existe.");
		}

		return result;
	}

	@DeleteMapping(path = "delete/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> result = new LinkedHashMap<>();
				
		Cargo exist = serv.buscarPorId(id);

		if (exist != null) {
			serv.eliminar(id);
			result.put("deleted", exist);
		} else {
			result.put("message", "Registro de ID " + id + " no existe.");
		}

		return result;
	}

}
