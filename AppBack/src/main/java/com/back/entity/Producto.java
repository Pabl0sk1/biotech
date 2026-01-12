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
@Table(name = "productos")
public class Producto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "producto_sec")
	@SequenceGenerator(name = "producto_sec", sequenceName = "productos_id_seq", allocationSize = 1)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "entidad_id")
	private Entidad entidad;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "nombrecomercial_id")
	private NombreComercial nombrecomercial;
	
	@ManyToOne
	@JoinColumn(name = "principioactivo_id")
	private PrincipioActivo principioactivo;
	
	@ManyToOne
	@JoinColumn(name = "fasecultivo_id")
	private FaseCultivo fasecultivo;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "tipoproducto_id")
	private TipoProducto tipoproducto;
	
	private Double dosisporhec;
	
	private Double costogerencial;
	
	private Double precio;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 15)
	@Builder.Default
	private String estado = "Activo";
	
	@NotNull
	@Builder.Default
	private Boolean activo = true;
	
	@Builder.Default
	private Boolean incluirplan = false;
	
	@Size(max = 150)
	private String obs;
	
	private Integer erpid;
	
	public Producto(Integer id) {
		super();
		this.id = id;
	}

}
