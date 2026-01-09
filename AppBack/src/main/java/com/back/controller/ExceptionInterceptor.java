package com.back.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionInterceptor {

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException e) {
	    Map<String, Object> map = new LinkedHashMap<>();
	    
	    map.put("ok", false);
	    map.put("message", e.getMessage());
	    
	    return ResponseEntity.badRequest().body(map);
	}

}
