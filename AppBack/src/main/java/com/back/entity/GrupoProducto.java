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
@Table(name = "grupoproductos")
public class GrupoProducto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "grupoproducto_sec")
	@SequenceGenerator(name = "grupoproducto_sec", sequenceName = "grupoproductos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "tributacion_id")
	private Tributacion tributacion;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "moneda_id")
	private Moneda moneda;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String grupoproducto;
	
	private Integer erpid;
	
	@OneToMany(mappedBy = "grupoproducto", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JsonManagedReference
	@Size(min = 1)
	public List<SubgrupoProducto> subgrupoproducto;
	
	public GrupoProducto(Integer id) {
		super();
		this.id = id;
	}

}
