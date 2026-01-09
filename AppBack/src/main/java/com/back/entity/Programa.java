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
@Table(name = "programas")
public class Programa {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "programa_sec")
	@SequenceGenerator(name = "programa_sec", sequenceName = "programas_id_seq", allocationSize = 1)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "menu_id")
	@JsonBackReference
	private Menu menu;
	
	@ManyToOne
	@JoinColumn(name = "submenu_id")
	@JsonBackReference
	private Submenu submenu;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "modulo_id")
	private Modulo modulo;
	
	@Size(max = 20)
	private String nombre;
	
	@Size(max = 50)
	private String ruta;
	
	@NotNull
	@Builder.Default
	private Boolean activo = true;
	
	private Integer orden;
	
	public Programa(Integer id) {
		super();
		this.id = id;
	}

}
