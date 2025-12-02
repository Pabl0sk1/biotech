package com.back.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "configuracion")
public class Configuracion {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "configuracion_sec")
	@SequenceGenerator(name = "configuracion_sec", sequenceName = "configuracion_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max=50)
	private String entidad;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max=30)
	private String correo;
	
	@Size(max=15)
	private String nrotelefono;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max=20)
	private String colorpri;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max=20)
	private String colorsec;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max=20)
	private String colorter;
	
	private String nombre;
    
    private String tipo;
    
	private String imagenurl;

	public Configuracion(Integer id) {
		super();
		this.id = id;
	}
	
}
