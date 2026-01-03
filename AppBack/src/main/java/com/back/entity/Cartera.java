package com.back.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "carteras")
public class Cartera {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cartera_sec")
	@SequenceGenerator(name = "cartera_sec", sequenceName = "carteras_id_seq", allocationSize = 1)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "entidad_id")
	private Entidad entidad;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 150)
	private String nombre;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 150)
	private String region;
	
	private Integer erpid;
	
	public Cartera(Integer id) {
		super();
		this.id = id;
	}

}
