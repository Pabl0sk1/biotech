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
@Table(name = "tributaciones")
public class Tributacion {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tributacion_sec")
	@SequenceGenerator(name = "tributacion_sec", sequenceName = "tributaciones_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String tributacion;
	
	private Integer iva;
	
	public Tributacion(Integer id) {
		super();
		this.id = id;
	}

}
