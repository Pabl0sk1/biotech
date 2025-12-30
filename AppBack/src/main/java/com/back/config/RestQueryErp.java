package com.back.config;

import java.util.ArrayList;
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
	
	@Value("${VERSAT_TOKEN}")
	private String token;
	
	private final RestTemplate restTemplate = new RestTemplate();

	@SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchAll(String recurso) {
		
		if (token == null || token.isBlank()) {
            throw new IllegalStateException("VERSAT_TOKEN no configurado");
        }

    	List<Map<String, Object>> result = new ArrayList<>();
    	int pagina = 1;
    	
    	while (true) {
    		
            String url = BASE_URL + "recurso=" + recurso + "&registros_por_pagina=1000" + "&pagina=" + pagina;

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

}
