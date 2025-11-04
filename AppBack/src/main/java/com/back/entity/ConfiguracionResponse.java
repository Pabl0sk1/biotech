package com.back.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConfiguracionResponse {

	private Integer id;
	private String entidad;
	private String nrotelefono;
	private String correo;
	private String colorpri;
	private String colorsec;
	private String colorter;
    private String nombre;
    private String tipo;
    private String base64imagen;
	
}
