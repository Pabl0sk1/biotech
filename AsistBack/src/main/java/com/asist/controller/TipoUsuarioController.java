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
import com.asist.entity.TipoUsuario;
import com.asist.service.TipoUsuarioService;

@RestController
@RequestMapping(path = "tipousuario")
public class TipoUsuarioController {

	@Autowired
	TipoUsuarioService serv;

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
	public Map<String, Object> guardar(@RequestBody TipoUsuario tipousuario) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		map.put("added", serv.guardar(tipousuario));
		return map;
	}

	@DeleteMapping(path = "eliminar/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();
		TipoUsuario tipousuario = new TipoUsuario();
		map.put("ok", true);
		int sw = 0;

		for (TipoUsuario v : serv.listar()) {
			if (v.getId().equals(id)) {
				tipousuario = v;
				sw = 1;
				break;
			}
		}

		if (sw == 1) {
			serv.eliminar(id);
			map.put("deleted", tipousuario);
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}

	@PutMapping(path = "modificar/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody TipoUsuario tipousuario) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		TipoUsuario existingTipoUsuario = serv.buscarPorId(id);

		if (existingTipoUsuario != null) {
			tipousuario.setId(id);
			map.put("modified", serv.guardar(tipousuario));
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}
	
	@GetMapping(path = "buscarPorTipoUsuarioDesc")
	public Map<String, Object> buscarPorTipoUsuarioDesc(
	        @RequestParam String tipousuario,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<TipoUsuario> tipousuarios = serv.BuscarPorTipoUsuario("%" + tipousuario + "%", pageable);
	        result.put("ok", true);
	        result.put("size", tipousuarios.getTotalElements());
	        result.put("list", tipousuarios.getContent());
	        result.put("totalPages", tipousuarios.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar materiales: " + e.getMessage());
	    }

	    return result;
	}

}
