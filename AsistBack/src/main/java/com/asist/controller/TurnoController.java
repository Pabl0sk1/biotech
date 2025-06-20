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
import com.asist.entity.Turno;
import com.asist.entity.TurnoDia;
import com.asist.service.TurnoDiaService;
import com.asist.service.TurnoService;

@RestController
@RequestMapping(path = "turno")
public class TurnoController {

	@Autowired
	TurnoService serv;
	
	@Autowired
	TurnoDiaService servdet;

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
	
	@GetMapping(path = "listarDetalle")
	public Map<String, Object> listarDetalle() {
		Map<String, Object> result = new HashMap<>();

		result.put("ok", true);
		result.put("size", servdet.listar().size());
		result.put("list", servdet.listar());

		return result;
	}

	@GetMapping(path = "buscarPorId/{id}")
	public Map<String, Object> buscarPorId(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();

		map.put("ok", true);
		map.put("list", serv.buscarPorId(id));

		return map;
	}
	
	@GetMapping(path = "buscarPorIdDetalle/{id}")
	public Map<String, Object> buscarPorIdDetalle(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();
		
		map.put("ok", true);
		map.put("list", servdet.buscarPorId(id));

		return map;
	}

	@PostMapping(path = "guardar")
	public Map<String, Object> guardar(@RequestBody Turno turno) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		map.put("added", serv.guardar(turno));
		return map;
	}

	@DeleteMapping(path = "eliminar/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();
		Turno turno = new Turno();
		map.put("ok", true);
		int sw = 0;

		for (Turno v : serv.listar()) {
			if (v.getId().equals(id)) {
				turno = v;
				sw = 1;
				break;
			}
		}

		if (sw == 1) {
			serv.eliminar(id);
			map.put("deleted", turno);
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}
	
	@DeleteMapping(path = "eliminarDetalle/{id}")
	public Map<String, Object> eliminarDetalle(@PathVariable Integer id) {
	    Map<String, Object> map = new HashMap<>();
	    try {
	        TurnoDia detalle = servdet.buscarPorId(id);
	        Turno turno = detalle.getTurno();
	        if (turno == null) {
	            throw new RuntimeException("El turno asociado al detalle no existe");
	        }
	        servdet.eliminar(id);
	        map.put("ok", true);
	        map.put("deleted", detalle); 
	    } catch (RuntimeException e) {
	        map.put("ok", false);
	        map.put("message", e.getMessage());
	    }
	    return map;
	}

	@PutMapping(path = "modificar/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Turno turno) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		Turno existingTurno = serv.buscarPorId(id);

		if (existingTurno != null) {
			turno.setId(id);
			map.put("modified", serv.guardar(turno));
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}
	
	@GetMapping(path = "buscarPorTipo")
	public Map<String, Object> buscarPorTipo(
	        @RequestParam String tipo,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Turno> turnos = serv.BuscarPorTipo("%" + tipo + "%", pageable);
	        result.put("ok", true);
	        result.put("size", turnos.getTotalElements());
	        result.put("list", turnos.getContent());
	        result.put("totalPages", turnos.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar turnos: " + e.getMessage());
	    }

	    return result;
	}
	
}
