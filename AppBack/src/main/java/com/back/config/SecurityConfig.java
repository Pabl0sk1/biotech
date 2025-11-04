package com.back.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class SecurityConfig extends OncePerRequestFilter {

	@Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String acceptHeader = request.getHeader("Accept");
        
        // Redirigir si es acceso directo a "/"
        if (uri.equals("/") || uri.equals("")) {
            // Verificar si hay sesión activa (puedes adaptar esto según tu lógica)
            Object usuario = request.getSession().getAttribute("usuarioLogueado");

            if (usuario != null) {
                response.sendRedirect("/asist/home");
            } else {
                response.sendRedirect("/asist/login");
            }
            return;
        }

        // Permitir libremente las rutas del frontend
        if (uri.startsWith("/asist") ||
            uri.startsWith("/assets") ||
            uri.endsWith(".js") ||
            uri.endsWith(".css") ||
            uri.endsWith(".svg")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Solo bloquear peticiones desde navegador
        boolean isBrowserGet = acceptHeader != null && acceptHeader.contains("text/html");

        if (isBrowserGet) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"ok\":false,\"mensaje\":\"Operación GET no permitida\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
