package com.back.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "permisos")
public class Permiso {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "permiso_sec")
	@SequenceGenerator(name = "permiso_sec", sequenceName = "permisos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "tipousuario_id")
	private TipoUsuario tipousuario;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "modulo_id")
	private Modulo modulo;
	
	@NotNull
	@Builder.Default
	private Boolean puedeconsultar = false;
	
	@NotNull
	@Builder.Default
    private Boolean puedever = false;

    @NotNull
    @Builder.Default
    private Boolean puedeagregar = false;

    @NotNull
    @Builder.Default
    private Boolean puedeeditar = false;

    @NotNull
    @Builder.Default
    private Boolean puedeeliminar = false;
    
    @Builder.Default
    private Boolean puedeimportar = false;
	
	public Permiso(Integer id) {
		super();
		this.id = id;
	}

}
