package com.back.controller;

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
import com.back.entity.Vendedor;
import com.back.service.VendedorService;

@RestController
@RequestMapping(path = "/api/vendedor")
public class VendedorController {

	@Autowired
	VendedorService serv;

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
	
	@GetMapping(path = "listarPorNombreONrodoc")
	public Map<String, Object> listarPorNombreONrodoc(@RequestParam String q) {
	    Map<String, Object> result = new HashMap<>();
	    
        result.put("ok", true);
        result.put("size", serv.BuscarPorNombreONrodoc("%" + q + "%", q + "%").size());
        result.put("list", serv.BuscarPorNombreONrodoc("%" + q + "%", q + "%"));

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
	public Map<String, Object> guardar(@RequestBody Vendedor vendedor) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		map.put("added", serv.guardar(vendedor));
		return map;
	}

	@DeleteMapping(path = "eliminar/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();
		Vendedor func = new Vendedor();
		map.put("ok", true);
		int sw = 0;

		for (Vendedor v : serv.listar()) {
			if (v.getId().equals(id)) {
				func = v;
				sw = 1;
				break;
			}
		}

		if (sw == 1) {
			serv.eliminar(id);
			map.put("deleted", func);
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}

	@PutMapping(path = "modificar/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Vendedor vendedor) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		Vendedor existingVendedor = serv.buscarPorId(id);

		if (existingVendedor != null) {
			vendedor.setId(id);
			map.put("modified", serv.guardar(vendedor));
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}
	
	@GetMapping(path = "buscarPorNrodoc")
	public Map<String, Object> buscarPorNrodoc(
	        @RequestParam String nrodoc,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Vendedor> vendedores = serv.BuscarPorNrodoc(nrodoc + "%", pageable);
	        result.put("ok", true);
	        result.put("size", vendedores.getTotalElements());
	        result.put("list", vendedores.getContent());
	        result.put("totalPages", vendedores.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar vendedores: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorNombre")
	public Map<String, Object> buscarPorNombre(
	        @RequestParam String nombre,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Vendedor> vendedores = serv.BuscarPorNombre("%" + nombre + "%", pageable);
	        result.put("ok", true);
	        result.put("size", vendedores.getTotalElements());
	        result.put("list", vendedores.getContent());
	        result.put("totalPages", vendedores.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar vendedores: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorNrodocYNombre")
	public Map<String, Object> buscarPorNrodocYNombre(
	        @RequestParam String nrodoc,
	        @RequestParam String nombre,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Vendedor> vendedores = serv.BuscarPorNrodocYNombre(nrodoc + "%", "%" + nombre + "%", pageable);
	        result.put("ok", true);
	        result.put("size", vendedores.getTotalElements());
	        result.put("list", vendedores.getContent());
	        result.put("totalPages", vendedores.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar vendedores: " + e.getMessage());
	    }

	    return result;
	}

}
