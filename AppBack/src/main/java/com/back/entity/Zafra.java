package com.back.entity;

import java.time.LocalDate;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
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
@Table(name = "zafras")
public class Zafra {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "zafra_sec")
	@SequenceGenerator(name = "zafra_sec", sequenceName = "zafras_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String descripcion;
	
	@Size(max = 30)
	private String cultura;
	
	@Temporal(TemporalType.DATE)
	private LocalDate fechainicio;
	
	@Temporal(TemporalType.DATE)
	private LocalDate fechafin;
	
	private Integer erpid;
	
	public Zafra(Integer id) {
		super();
		this.id = id;
	}

}
