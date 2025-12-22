package com.back.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
	name = "nombrecomerciales",
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"nombrecomercial"}, name = "nombrecomercial_uq1")
	}
)
public class NombreComercial {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nombrecomercial_sec")
	@SequenceGenerator(name = "nombrecomercial_sec", sequenceName = "nombrecomerciales_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "subgrupoproducto_id")
	private SubgrupoProducto subgrupoproducto;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "medida_id")
	private Medida medida;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String nombrecomercial;
	
	private Integer erpid;
	
	public NombreComercial(Integer id) {
		super();
		this.id = id;
	}

}
