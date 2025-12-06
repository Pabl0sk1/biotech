package com.back.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@Table(
	name = "modulos", 
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"var"}, name = "modulo_uq1")
	}
)
public class Modulo {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "modulo_sec")
	@SequenceGenerator(name = "modulo_sec", sequenceName = "modulos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String moduloes;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String moduloen;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 10)
	private String var;
	
	public Modulo(Integer id) {
		super();
		this.id = id;
	}
	
}
