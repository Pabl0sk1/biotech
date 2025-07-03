package com.asist.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.asist.entity.Cargo;
import com.asist.service.CargoService;

@RestController
@RequestMapping(path = "cargo")
public class CargoController {
	
	@Autowired
	CargoService serv;

	@GetMapping(path = "listar")
	public Map<String, Object> listar() {
		Map<String, Object> result = new HashMap<>();

		result.put("ok", true);
		result.put("size", serv.listar().size());
		result.put("list", serv.listar());

		return result;
	}
	
	@GetMapping(path = "listarPaginado")
	public Map<String, Object> listarTabla(@RequestParam(defaultValue = "0") int page,
										   @RequestParam(defaultValue = "10") int size,
										   @RequestParam(defaultValue = "id") String sortBy,
									   	   @RequestParam(defaultValue = "false") boolean sortType){
		Map<String, Object> result = new HashMap<>();

		result.put("ok", true);
		result.put("size", serv.listarPaginado(page, size, sortBy, sortType).getSize());
		result.put("list", serv.listarPaginado(page, size, sortBy, sortType));

		return result;
	}

	@GetMapping(path = "buscarPorId/{id}")
	public Map<String, Object> buscarPorId(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();

		map.put("ok", true);
		map.put("list", serv.buscarPorId(id));

		return map;
	}

	@PostMapping(path = "guardar")
	public Map<String, Object> guardar(@RequestBody Cargo cargo) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		map.put("added", serv.guardar(cargo));
		return map;
	}

	@DeleteMapping(path = "eliminar/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();
		Cargo cargo = new Cargo();
		map.put("ok", true);
		int sw = 0;

		for (Cargo v : serv.listar()) {
			if (v.getId().equals(id)) {
				cargo = v;
				sw = 1;
				break;
			}
		}

		if (sw == 1) {
			serv.eliminar(id);
			map.put("deleted", cargo);
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}

	@PutMapping(path = "modificar/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Cargo cargo) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		Cargo existingCargo = serv.buscarPorId(id);

		if (existingCargo != null) {
			cargo.setId(id);
			map.put("modified", serv.guardar(cargo));
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}
	
	@GetMapping(path = "buscarPorCargoDesc")
	public Map<String, Object> buscarPorCargoDesc(
	        @RequestParam String cargo,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Cargo> cargos = serv.BuscarPorCargo("%" + cargo + "%", pageable);
	        result.put("ok", true);
	        result.put("size", cargos.getTotalElements());
	        result.put("list", cargos.getContent());
	        result.put("totalPages", cargos.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar cargos: " + e.getMessage());
	    }

	    return result;
	}

}
