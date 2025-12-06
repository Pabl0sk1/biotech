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
	name = "cargos", 
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"cargo"}, name = "cargo_uq1")
	}
)
public class Cargo {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cargo_sec")
	@SequenceGenerator(name = "cargo_sec", sequenceName = "cargos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String cargo;
	
	public Cargo(Integer id) {
		super();
		this.id = id;
	}

}
