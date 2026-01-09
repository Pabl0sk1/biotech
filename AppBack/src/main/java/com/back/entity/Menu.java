package com.back.entity;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "menus")
public class Menu {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "menu_sec")
	@SequenceGenerator(name = "menu_sec", sequenceName = "menus_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String menu;
	
	@Size(max = 30)
	private String icono;
	
	@NotNull
	@Builder.Default
	private Boolean unico = false;
	
	@NotNull
	@Builder.Default
	private Boolean activo = true;
	
	private Integer orden;
	
	private String recursos;
	
	@OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JsonManagedReference("menu-submenu")
	public List<Submenu> submenus;
	
	@OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JsonManagedReference("menu-programa")
	public List<Programa> programas;
	
	public Menu(Integer id) {
		super();
		this.id = id;
	}

}
