package com.back.entity;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
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
@Table(name = "comisiones")
public class Comision {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comision_sec")
	@SequenceGenerator(name = "comision_sec", sequenceName = "comisiones_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "entidad_id")
	private Entidad entidad;
	
	@ManyToOne
	@JoinColumn(name = "grupoproducto_id")
	private GrupoProducto grupoproducto;
	
	@ManyToOne
	@JoinColumn(name = "subgrupoproducto_id")
	private SubgrupoProducto subgrupoproducto;
	
	@ManyToOne
	@JoinColumn(name = "producto_id")
	private Producto producto;
	
	@NotNull
	@Size(max = 30)
	private String basecalculo;
	
	private Double porcentaje;
	
	private Integer erpid;
	
	@OneToMany(mappedBy = "comision", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JsonManagedReference("comision-zafra")
	public List<ComisionZafra> zafras;
	
	public Comision(Integer id) {
		super();
		this.id = id;
	}

}
