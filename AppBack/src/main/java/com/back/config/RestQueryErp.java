package com.back.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
public class RestQueryErp {
	
	private static final String BASE_URL = "https://app.versat.ag/api/Polling/Data?";
	
	@Value("${versat.token}")
	private String token;
	
	private final RestTemplate restTemplate = new RestTemplate();

	@SuppressWarnings({ "unchecked", "null", "rawtypes" })
    public List<Map<String, Object>> fetchAll(String recurso, String filtro, String valor, String detalle) {
		
		if (token == null || token.isBlank()) {
            throw new IllegalStateException("VERSAT_TOKEN no configurado");
        }

    	List<Map<String, Object>> result = new ArrayList<>();
    	int pagina = 1;
    	
    	while (true) {
    		
            String url = BASE_URL + "recurso=" + recurso + "&registros_por_pagina=1000" + "&pagina=" + pagina 
            		+ "&filtro_valor=" + filtro + "&filtro_valor=" + valor + "&detalle=" + detalle;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) break;

            List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("Items");

            if (items == null || items.isEmpty()) break;

            result.addAll(items);
            pagina++;
        }

        return result;
    }
	
	public LocalDate parseDate(Object value) {
		if (value == null) return null;

	    try {
	        return LocalDateTime.parse(value.toString()).toLocalDate();
	    } catch (Exception e) {
	        return null;
	    }
	}
	
	public Double parseDouble(Object value) {
	    if (value == null) return null;

	    if (value instanceof Number n) {
	        return n.doubleValue();
	    }

	    try {
	        return Double.parseDouble(value.toString().replace(",", "."));
	    } catch (Exception e) {
	        return null;
	    }
	}
	
	public Map<String, Object> formatName(Object value) {
		Map<String, Object> body = new HashMap<String, Object>();
		
		String fullName = value.toString();
		String nombre = "";
        String apellido = "";
        String nomape = "";

        if (fullName != null && fullName.contains(",")) {
            String[] parts = fullName.split(",", 2);
            apellido = parts[0].trim();
            nombre = parts[1].trim();
            nomape = nombre + ", " + apellido;
        } else {
            nombre = fullName;
            nomape = fullName;
        }
        
        body.put("nomape", nomape);
        body.put("nombre", nombre);
        body.put("apellido", apellido);
		
		return body;
	}

}
