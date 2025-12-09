package com.back.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;

@Component
@EnableWebSecurity
public class SecurityConfig {
	
	private final BearerTokenFilter brt;
	
	public SecurityConfig(BearerTokenFilter brt) {
		this.brt = brt;
	}

	@Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .securityMatcher("/api/**")
            .authorizeHttpRequests(auth -> auth
            		.requestMatchers("/api/**").permitAll()
            		.anyRequest().authenticated()
            )
            .addFilterBefore(brt, UsernamePasswordAuthenticationFilter.class)
            .sessionManagement(session -> session
            		.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }
}
