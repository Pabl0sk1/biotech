package com.back.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionInterceptor {

	@ExceptionHandler({ Exception.class })
	public Map<String, Object> interceptarExcepcion(Exception e) {
		Map<String, Object> map = new HashMap<String, Object>();

		map.put("ok", false);
		map.put("error", e.getMessage());

		return map;
	}

}
