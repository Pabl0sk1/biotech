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
@Table(name = "tipoinformes")
public class TipoInforme {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tipoinforme_sec")
	@SequenceGenerator(name = "tipoinforme_sec", sequenceName = "tipoinformes_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotBlank
	@NotEmpty
	@Size(max = 150)
	private String tipoinforme;
	
	public TipoInforme(Integer id) {
		super();
		this.id = id;
	}

}
