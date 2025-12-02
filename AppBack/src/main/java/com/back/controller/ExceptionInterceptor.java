package com.back.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionInterceptor {

	@ExceptionHandler({ Exception.class })
	public Map<String, Object> interceptarExcepcion(Exception e) {
		Map<String, Object> map = new LinkedHashMap<String, Object>();

		map.put("ok", false);
		map.put("message", e.getMessage());

		return map;
	}

}
