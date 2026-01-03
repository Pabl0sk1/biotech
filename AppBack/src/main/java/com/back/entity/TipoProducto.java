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
@Table(name = "tipoproductos")
public class TipoProducto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tipoproducto_sec")
	@SequenceGenerator(name = "tipoproducto_sec", sequenceName = "tipoproductos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 150)
	private String tipoproducto;
	
	@Size(max = 20)
	private String recurso;
	
	public TipoProducto(Integer id) {
		super();
		this.id = id;
	}

}
