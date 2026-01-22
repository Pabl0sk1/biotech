package com.back.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "subgrupoproductos")
public class SubgrupoProducto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "subgrupoproducto_sec")
	@SequenceGenerator(name = "subgrupoproducto_sec", sequenceName = "subgrupoproductos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "grupoproducto_id")
	@JsonBackReference("grupoproducto-subgrupoproducto")
	private GrupoProducto grupoproducto;
	
	@NotNull
	@NotBlank
	@NotEmpty
	@Size(max = 150)
	private String subgrupoproducto;
	
	@Size(max = 150)
	private String grupoproductotxt;
	
	private Integer erpid;
	
	public SubgrupoProducto(Integer id) {
		super();
		this.id = id;
	}

}
