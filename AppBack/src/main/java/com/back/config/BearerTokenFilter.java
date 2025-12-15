package com.back.config;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.back.entity.Token;
import com.back.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class BearerTokenFilter extends OncePerRequestFilter {
	
	@Autowired
	TokenService servT;
	
	@Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain
    ) throws ServletException, IOException {
		
		String path = request.getRequestURI();
		if (!path.startsWith("/api/")) {
	        filterChain.doFilter(request, response);
	        return;
	    }
		
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Error: Se requiere token Bearer");
            return;
        }

        String tokenString = authHeader.substring(7);
        Token token = servT.buscarPorToken(tokenString);
        if (token == null || !token.getActivo() || token.getFechaexpiracion().isBefore(LocalDate.now())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Error: Token invalido o expirado");
            return;
        }
        
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(tokenString, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
	
}
