package com.back.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.back.entity.Token;
import com.back.entity.Usuario;
import com.back.repository.TokenRepository;

@Service
public class TokenService {
	
	@Autowired
	TokenRepository rep;
	
	@Autowired
	UsuarioService serv;
	
	public List<Token> listar() {
		List<Token> result = new ArrayList<Token>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Page<Token> listarPaginado(int page, int size, String sortBy, boolean sortType) {
        Sort sort = sortType ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return rep.findAll(pageable);
	}

	public Token guardar(Integer usuarioId) {
		Usuario usuario = serv.buscarPorId(usuarioId);

	    Token token = new Token();
	    token.setUsuario(usuario);
	    token.setToken(UUID.randomUUID().toString());
	    token.setFecha_creacion(LocalDateTime.now());
	    token.setFecha_expiracion(LocalDateTime.now().plusMonths(6));
	    token.setActivo(true);

	    return rep.save(token);
	}

	public void eliminar(Integer id) {

		rep.deleteById(id);

	}

	public Token buscarPorId(Integer id) {

		Optional<Token> token = rep.findById(id);

		if (token.isPresent()) {
			return token.get();
		} else {
			throw new RuntimeException("No se encontro el token con ID: " + id);
		}

	}
	
	public Page<Token> BuscarPorUsuario(String usuario, Pageable pageable){
		return rep.findByUsuario(usuario, pageable);
	}

}
