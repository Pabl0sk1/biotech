package com.back.entity;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "submenus")
public class Submenu {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "submenu_sec")
	@SequenceGenerator(name = "submenu_sec", sequenceName = "submenus_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "menu_id")
	@JsonBackReference
	private Menu menu;
	
	@NotNull
	@NotBlank
	@NotEmpty
	@Size(max = 50)
	private String submenu;
	
	@NotNull
	@Builder.Default
	private Boolean activo = true;
	
	private Integer orden;
	
	private String recursos;
	
	@OneToMany(mappedBy = "submenu", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JsonManagedReference
	public List<Programa> programas;
	
	public Submenu(Integer id) {
		super();
		this.id = id;
	}

}
