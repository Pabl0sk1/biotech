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
import org.springframework.web.multipart.MultipartFile;
import com.back.entity.Usuario;
import com.back.service.UsuarioService;

@RestController
@RequestMapping(path = "/api/user")
public class UsuarioController {
	
	@Autowired
	UsuarioService serv;
	
	@GetMapping("list")
	public Map<String, Object> listar(
	        @RequestParam(required = false) Integer page,
	        @RequestParam(required = false) Integer size,
	        @RequestParam(required = false) String order,
	        @RequestParam(required = false) String filter,
	        @RequestParam(required = false) String detail
	) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		var data = serv.query(Usuario.class, page, size, order, filter, detail);
	    
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
	public Map<String, Object> guardar(@RequestBody Usuario usuario) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		result.put("saved", serv.guardar(usuario));
		
		return result;
	}

	@PutMapping(path = "update/{id}")
	public Map<String, Object> modificar(@PathVariable Integer id, @RequestBody Usuario usuario) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		Usuario exist = serv.buscarPorId(id);
		
		if (usuario.getContrasena() == null) usuario.setContrasena(exist.getContrasena());

		if (exist != null) {
			usuario.setId(id);
			result.put("updated", serv.guardar(usuario));
		} else {
			result.put("message", "Registro de ID " + id + " no existe.");
		}

		return result;
	}
	
	@PutMapping(path = "updateImage/{id}", consumes = "multipart/form-data")
	public Map<String, Object> modificarImagen(@PathVariable Integer id,
							 			       @RequestParam(value = "imagen", required = false) MultipartFile imagenurl,
							 			       @RequestParam(value = "imagenAnterior", required = false) String imagenAnt
	) throws Exception {
		Map<String, Object> result = new LinkedHashMap<>();
		
		Usuario usuario = serv.buscarPorId(id);
		if (usuario == null) {
	        result.put("message", "Registro de ID " + id + " no existe.");
	        return result;
	    }
	    
	    if (imagenurl != null && !imagenurl.isEmpty()) {
	    	if (imagenAnt != null && !imagenAnt.isEmpty()) {
	            serv.eliminarImagen(imagenAnt);
	        }
	    	
	        String ruta = serv.guardarImagen(imagenurl);
	        usuario.setImagenurl(ruta);
	        usuario.setImagennombre(imagenurl.getOriginalFilename());
	        usuario.setImagentipo(imagenurl.getContentType());
	    } else {
	    	usuario.setImagenurl(usuario.getImagenurl());
	    	usuario.setImagennombre(usuario.getImagennombre());
	    	usuario.setImagentipo(usuario.getImagentipo());
	    }

	    result.put("updated", serv.guardar(usuario));
		return result;
	}
	
	@DeleteMapping(path = "delete/{id}")
	public Map<String, Object> eliminar(@PathVariable Integer id) {
		Map<String, Object> result = new LinkedHashMap<>();
		
		if(id != 1) {
			Usuario exist = serv.buscarPorId(id);

			if (exist != null) {
				serv.eliminar(id);
				result.put("deleted", exist);
			} else {
				result.put("message", "Registro de ID " + id + " no existe.");
			}
		} else {
			result.put("message", "No se puede eliminar el usuario de ID " + id);
		}

		return result;
	}
	
	@PostMapping(path = "login")
	public Map<String, Object> iniciarSesion(@RequestBody Map<String, String> credentials) {
	    Map<String, Object> result = new LinkedHashMap<>();
	    
	    String nombreusuario = credentials.get("nombreusuario");
	    String contrasena = credentials.get("contrasena");
	    
	    if (serv.verificarContrasena(nombreusuario, contrasena)) {
	        Usuario usuario = serv.buscarPorNombreUsuario(nombreusuario);
	        
	        result.put("ok", true);
	        result.put("user", usuario);
	        result.put("message", "Inicio de sesión exitoso");
	    } else {
	    	result.put("message", "Nombre de usuario o contraseña incorrectos");
	    }
	    
	    return result;
	}
	
	@PostMapping(path = "changePassword/{id}")
	public Map<String, Object> cambiarContrasena(@PathVariable Integer id, @RequestBody Map<String, String> credentials) {
	    Map<String, Object> result = new LinkedHashMap<>();
	    
        String contrasenaActual = credentials.get("contrasenaActual");
        String contrasenaNueva = credentials.get("contrasenaNueva");
        
        if (serv.verificarContrasenaID(id, contrasenaActual)) {
            serv.actualizarContrasena(id, contrasenaNueva);
            Usuario usuario = serv.buscarPorId(id);
            
            result.put("ok", true);
            result.put("user", usuario);
            result.put("message", "Contraseña actualizada correctamente");
        } else {
        	result.put("message", "Las credenciales son incorrectas");
        }
	    
	    return result;
	}
	
	@DeleteMapping("deleteImage/{id}")
	public Map<String, Object> eliminarImagen(@PathVariable Integer id) throws Exception {
	    Map<String, Object> result = new LinkedHashMap<>();

	    Usuario usuario = serv.buscarPorId(id);
	    if (usuario == null) {
	    	result.put("message", "Registro de ID " + id + " no existe.");
	        return result;
	    }
	    
	    if (usuario.getImagenurl() != null && !usuario.getImagenurl().isEmpty()) {
	        serv.eliminarImagen(usuario.getImagenurl());
	        usuario.setImagenurl(null);
	        usuario.setImagennombre(null);
	        usuario.setImagentipo(null);
	        serv.guardar(usuario);
	    }

	    result.put("deleted", true);
	    return result;
	}

}
