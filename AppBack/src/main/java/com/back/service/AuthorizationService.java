package com.back.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.back.entity.Permiso;
import com.back.entity.Usuario;
import com.back.repository.PermisoRepository;

@Service
public class AuthorizationService {
	
	@Autowired
    PermisoRepository rep;

    public boolean hasPermission(Usuario usuario, String modulo, String accion) {
        Permiso permisos = rep.findByTipoUsuarioIdAndModulo(usuario.getTipousuario().getId(), modulo);
        
        if (permisos == null) return false;

        return switch (accion.toLowerCase()) {
            case "consultar", "list" -> permisos.getPuedeconsultar();
            case "agregar", "save" -> permisos.getPuedeagregar();
            case "editar", "update" -> permisos.getPuedeeditar();
            case "eliminar", "delete" -> permisos.getPuedeeliminar();
            default -> false;
        };
    }
    
    public Usuario validarPermiso(String modulo, String accion) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!this.hasPermission(usuario, modulo, accion)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para " + accion + " " + modulo);
        }
        return usuario;
    }

}
