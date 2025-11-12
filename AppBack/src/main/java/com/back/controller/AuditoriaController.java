package com.back.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;
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
import com.back.entity.Auditoria;
import com.back.service.AuditoriaService;

@RestController
@RequestMapping(path = "/api/auditoria")
public class AuditoriaController {

	@Autowired
	AuditoriaService serv;

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
	
	@GetMapping(path = "networkInfo")
	public Map<String, Object> obtenerNetworkInfo() {
	    Map<String, Object> result = new HashMap<>();

	    try {
	        InetAddress inetAddress = InetAddress.getLocalHost();
	        String ipAddress = inetAddress.getHostAddress();
	        String hostName = inetAddress.getHostName();

	        result.put("ok", true);
	        result.put("ip", ipAddress);
	        result.put("equipo", hostName);
	    } catch (UnknownHostException e) {
	        result.put("ok", false);
	        result.put("message", "Error al obtener la información de red: " + e.getMessage());
	    }

	    return result;
	}

	@PostMapping(path = "guardar")
	public Map<String, Object> guardar(@RequestBody Auditoria auditoria) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		map.put("added", serv.guardar(auditoria));
		return map;
	}

	@DeleteMapping(path = "eliminar/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();
		Auditoria auditoria = new Auditoria();
		map.put("ok", true);
		int sw = 0;
		
		for (Auditoria v : serv.listar()) {
			if (v.getId().equals(id)) {
				auditoria = v;
				sw = 1;
				break;
			}
		}
		
		if (sw == 1) {
			serv.eliminar(id);
			map.put("deleted", auditoria);
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}

	@PutMapping(path = "modificar/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Auditoria auditoria) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		Auditoria existingAuditoria = serv.buscarPorId(id);

		if (existingAuditoria != null) {
			auditoria.setId(id);
			map.put("modified", serv.guardar(auditoria));
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}
	
	@GetMapping(path = "buscarPorIdUsuario")
	public Map<String, Object> buscarPorIdUsuario(
	        @RequestParam Integer id,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Auditoria> auditorias = serv.BuscarPorIdUsuario(id, pageable);
	        result.put("ok", true);
	        result.put("size", auditorias.getTotalElements());
	        result.put("list", auditorias.getContent());
	        result.put("totalPages", auditorias.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar auditorias: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorOperacion")
	public Map<String, Object> buscarPorOperacion(
	        @RequestParam String operacion,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Auditoria> auditorias = serv.BuscarPorOperacion(operacion, pageable);
	        result.put("ok", true);
	        result.put("size", auditorias.getTotalElements());
	        result.put("list", auditorias.getContent());
	        result.put("totalPages", auditorias.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar auditorias: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorIdUsuarioYOperacion")
	public Map<String, Object> buscarPorIdUsuarioYOperacion(
	        @RequestParam Integer id,
	        @RequestParam String operacion,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Auditoria> auditorias = serv.BuscarPorIdUsuarioYOperacion(id, operacion, pageable);
	        result.put("ok", true);
	        result.put("size", auditorias.getTotalElements());
	        result.put("list", auditorias.getContent());
	        result.put("totalPages", auditorias.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar auditorias: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorUsuario")
	public Map<String, Object> buscarPorUsuario(
	        @RequestParam String usuario,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Auditoria> auditorias = serv.BuscarPorUsuario(usuario, pageable);
	        result.put("ok", true);
	        result.put("size", auditorias.getTotalElements());
	        result.put("list", auditorias.getContent());
	        result.put("totalPages", auditorias.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar auditorias: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorUsuarioYOperacion")
	public Map<String, Object> buscarPorUsuarioYOperacion(
	        @RequestParam String usuario,
	        @RequestParam String operacion,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Auditoria> auditorias = serv.BuscarPorUsuarioYOperacion(usuario, operacion, pageable);
	        result.put("ok", true);
	        result.put("size", auditorias.getTotalElements());
	        result.put("list", auditorias.getContent());
	        result.put("totalPages", auditorias.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar auditorias: " + e.getMessage());
	    }

	    return result;
	}

}
