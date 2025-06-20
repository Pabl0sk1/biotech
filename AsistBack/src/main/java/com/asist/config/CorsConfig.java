package com.asist.config;

import java.net.UnknownHostException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
	
	@Value("${app.allowed.origins:http://localhost:5173}") 
	private String[] allowedOrigins;

    @Bean
    WebMvcConfigurer corsConfigurer() throws UnknownHostException {
    	
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // todas las rutas
                        .allowedOrigins(allowedOrigins) // origen del frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true); // si usás cookies/sesiones
            }
        };
    }
}
