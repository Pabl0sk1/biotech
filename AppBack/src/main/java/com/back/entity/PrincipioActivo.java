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
@Table(name = "principioactivos")
public class PrincipioActivo {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "principioactivo_sec")
	@SequenceGenerator(name = "principioactivo_sec", sequenceName = "principioactivos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 150)
	private String principioactivo;
	
	private Integer erpid;
	
	public PrincipioActivo(Integer id) {
		super();
		this.id = id;
	}

}
