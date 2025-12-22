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
	name = "fasecultivos", 
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"fasecultivo"}, name = "fasecultivo_uq1")
	}
)
public class FaseCultivo {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "fasecultivo_sec")
	@SequenceGenerator(name = "fasecultivo_sec", sequenceName = "fasecultivos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String fasecultivo;
	
	private Integer erpid;
	
	public FaseCultivo(Integer id) {
		super();
		this.id = id;
	}

}
