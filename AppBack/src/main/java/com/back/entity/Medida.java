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
	name = "medidas",
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"medida"}, name = "medida_uq1")
	}
)
public class Medida {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medida_sec")
	@SequenceGenerator(name = "medida_sec", sequenceName = "medidas_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String medida;
	
	private Integer erpid;
	
	public Medida(Integer id) {
		super();
		this.id = id;
	}

}
