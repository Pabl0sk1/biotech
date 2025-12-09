package com.back.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
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
import com.back.entity.Token;
import com.back.entity.Usuario;
import com.back.service.TokenService;
import com.back.service.UsuarioService;

@RestController
@RequestMapping(path = "/api/token")
public class TokenController {
	
	@Autowired
	TokenService serv;
	
	@Autowired
	UsuarioService servU;
	
	@GetMapping("list")
	public Map<String, Object> listar(
	        @RequestParam(required = false) Integer page,
	        @RequestParam(required = false) Integer size,
	        @RequestParam(required = false) String order,
	        @RequestParam(required = false) String filter,
	        @RequestParam(required = false) String detail
	) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		var data = serv.query(Token.class, page, size, order, filter, detail);
	    
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

	@PostMapping(path = "save/{id}")
	public Map<String, Object> guardar(@PathVariable Integer id) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		Usuario usuario = servU.buscarPorId(id);

	    Token token = new Token();
	    token.setUsuario(usuario);
	    token.setToken(UUID.randomUUID().toString());
	    token.setFechacreacion(LocalDate.now());
	    token.setFechaexpiracion(LocalDate.now().plusMonths(6));
	    token.setFechahoracreacion(LocalDateTime.now());
	    token.setFechahoraexpiracion(LocalDateTime.now().plusMonths(6));
	    token.setActivo(true);
	    token.setEstado("Activo");
	    
		result.put("saved", serv.guardar(token));
		
		return result;
	}
	
	@PutMapping(path = "update/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Token token) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		if(id != 1) {
			Token exist = serv.buscarPorId(id);

			if (exist != null) {
				token.setId(id);
				result.put("updated", serv.guardar(token));
			} else {
				result.put("message", "Registro de ID " + id + " no existe.");
			}
		} else {
			result.put("message", "No se puede modificar el token de ID " + id);
		}

		return result;
	}

	@DeleteMapping(path = "delete/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		if (id != 1) {
			Token exist = serv.buscarPorId(id);

			if (exist != null) {
				serv.eliminar(id);
				result.put("deleted", exist);
			} else {
				result.put("message", "Registro de ID " + id + " no existe.");
			}
		} else {
			result.put("message", "No se puede eliminar el token de ID " + id);
		}

		return result;
	}

}
