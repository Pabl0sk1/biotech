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
import com.back.entity.Usuario;
import com.back.service.UsuarioService;

@RestController
@RequestMapping(path = "/api/usuario")
public class UsuarioController {
	
	@Autowired
	UsuarioService serv;

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
	public Map<String, Object> guardar(@RequestBody Usuario usuario) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		map.put("added", serv.guardar(usuario));
		return map;
	}

	@DeleteMapping(path = "eliminar/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> map = new HashMap<>();
		Usuario usuario = new Usuario();
		map.put("ok", true);
		int sw = 0;

		for (Usuario v : serv.listar()) {
			if (v.getId().equals(id)) {
				usuario = v;
				sw = 1;
				break;
			}
		}

		if (sw == 1) {
			serv.eliminar(id);
			map.put("deleted", usuario);
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}

	@PutMapping(path = "modificar/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Usuario usuario) {
		Map<String, Object> map = new HashMap<>();
		map.put("ok", true);
		Usuario existingUsuario = serv.buscarPorId(id);

		if (existingUsuario != null) {
			usuario.setId(id);
			map.put("modified", serv.guardar(usuario));
		} else {
			map.put("message", "Registro de ID " + id + " no existe.");
		}

		return map;
	}
	
	@GetMapping(path = "buscarPorNombre")
	public Map<String, Object> buscarPorNombre(
	        @RequestParam String nombreusuario,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Usuario> usuarios = serv.BuscarPorNombre("%" + nombreusuario + "%", pageable);
	        result.put("ok", true);
	        result.put("size", usuarios.getTotalElements()); // Total de elementos (todas las páginas)
	        result.put("list", usuarios.getContent()); // Usuarios solo de la página actual
	        result.put("totalPages", usuarios.getTotalPages()); // Número total de páginas
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar usuarios: " + e.getMessage());
	    }

	    return result;
	}

	
	@GetMapping(path = "buscarPorEstado")
	public Map<String, Object> buscarPorEstado(
	        @RequestParam Character estado,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        // Cambia el repositorio para que devuelva un Page<Usuario>
	        Page<Usuario> usuarios = serv.BuscarPorEstado(estado, pageable);
	        result.put("ok", true);
	        result.put("size", usuarios.getTotalElements()); // Tamaño de la página
	        result.put("list", usuarios.getContent()); // Los usuarios de la página actual
	        result.put("totalPages", usuarios.getTotalPages()); // Total de páginas
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar usuarios: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorIdRol")
	public Map<String, Object> buscarPorIdRol(
			@RequestParam Integer id,
			@RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType){
		Map<String, Object> result = new HashMap<>();
		Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);
		
		try {
	        // Cambia el repositorio para que devuelva un Page<Usuario>
	        Page<Usuario> usuarios = serv.BuscarPorIdRol(id, pageable);
	        result.put("ok", true);
	        result.put("size", usuarios.getTotalElements()); // Total de elementos
	        result.put("list", usuarios.getContent()); // Los usuarios de la página actual
	        result.put("totalPages", usuarios.getTotalPages()); // Total de páginas
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar usuarios: " + e.getMessage());
	    }
		
		return result;
	}

	@GetMapping(path = "buscarPorNombreYEstado")
	public Map<String, Object> buscarPorNombreYEstado(
	        @RequestParam String nombreusuario,
	        @RequestParam Character estado,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Usuario> usuarios = serv.BuscarPorNombreYEstado("%" + nombreusuario + "%", estado, pageable);
	        result.put("ok", true);
	        result.put("size", usuarios.getTotalElements());
	        result.put("list", usuarios.getContent());
	        result.put("totalPages", usuarios.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar usuarios: " + e.getMessage());
	    }

	    return result;
	}

	@GetMapping(path = "buscarPorNombreYIdRol")
	public Map<String, Object> buscarPorNombreYIdRol(
	        @RequestParam String nombreusuario,
	        @RequestParam Integer id,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Usuario> usuarios = serv.BuscarPorNombreYIdRol("%" + nombreusuario + "%", id, pageable);
	        result.put("ok", true);
	        result.put("size", usuarios.getTotalElements());
	        result.put("list", usuarios.getContent());
	        result.put("totalPages", usuarios.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar usuarios: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorIdRolYEstado")
	public Map<String, Object> buscarPorIdRolYEstado(
	        @RequestParam Integer id,
	        @RequestParam Character estado,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Usuario> usuarios = serv.BuscarPorIdRolYEstado(id, estado, pageable);
	        result.put("ok", true);
	        result.put("size", usuarios.getTotalElements());
	        result.put("list", usuarios.getContent());
	        result.put("totalPages", usuarios.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar usuarios: " + e.getMessage());
	    }

	    return result;
	}
	
	@GetMapping(path = "buscarPorNombreYIdRolYEstado")
	public Map<String, Object> buscarPorNombreYEstado(
	        @RequestParam String nombreusuario,
	        @RequestParam Character estado,
	        @RequestParam Integer id,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "id") String sortBy,
	   	    @RequestParam(defaultValue = "false") boolean sortType) {
	    Map<String, Object> result = new HashMap<>();
	    Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	    Pageable pageable = PageRequest.of(page, size, sort);

	    try {
	        Page<Usuario> usuarios = serv.BuscarPorNombreYIdRolYEstado("%" + nombreusuario + "%", id, estado, pageable);
	        result.put("ok", true);
	        result.put("size", usuarios.getTotalElements());
	        result.put("list", usuarios.getContent());
	        result.put("totalPages", usuarios.getTotalPages());
	    } catch (Exception e) {
	        result.put("ok", false);
	        result.put("message", "Error al buscar usuarios: " + e.getMessage());
	    }

	    return result;
	}
	
	@PostMapping(path = "login")
	public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
	    Map<String, Object> result = new HashMap<>();
	    
	    String nombreusuario = credentials.get("nombreusuario");
	    String contrasena = credentials.get("contrasena");
	    
	    if (serv.verificarContrasena(nombreusuario, contrasena)) {
	        Usuario usuario = serv.BuscarPorNombreUsuario(nombreusuario);
	        
	        result.put("ok", true);
	        result.put("message", "Inicio de sesión exitoso");
	        result.put("usuario", usuario);
	    } else {
	        result.put("ok", false);
	        result.put("message", "Nombre de usuario o contraseña incorrectos");
	    }
	    
	    return result;
	}
	
	@PostMapping(path = "cambiarContrasena/{id}")
	public Map<String, Object> cambiarContrasena(@PathVariable Integer id, @RequestBody Map<String, String> datos) {
	    Map<String, Object> resultado = new HashMap<>();
	    
	    try {
	        String contrasenaActual = datos.get("contrasenaActual");
	        String contrasenaNueva = datos.get("contrasenaNueva");
	        
	        // Verificar que la contraseña actual sea correcta
	        if (serv.verificarContrasenaID(id, contrasenaActual)) {
	            // Actualizar contraseña
	            serv.actualizarContrasena(id, contrasenaNueva);
	            
	            resultado.put("ok", true);
	            resultado.put("message", "Contraseña actualizada correctamente");
	        } else {
	            resultado.put("ok", false);
	            resultado.put("message", "La contraseña actual es incorrecta");
	        }
	    } catch (Exception e) {
	        resultado.put("ok", false);
	        resultado.put("message", "Error al cambiar contraseña: " + e.getMessage());
	    }
	    
	    return resultado;
	}

}
