package com.back.entity;

import java.time.LocalDate;
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
@Table(name = "informes")
public class Informe {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "informe_sec")
	@SequenceGenerator(name = "informe_sec", sequenceName = "informes_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "usuario_id")
	private Usuario usuario;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "tipoinforme_id")
	private TipoInforme tipoinforme;
	
	@NotNull
	@NotBlank
	@NotEmpty
	@Size(max = 150)
	private String descripcion;
	
	private LocalDate fechacreacion;
	
	private LocalDate fechaactualizacion;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 15)
	@Builder.Default
	private String estado = "Borrador";
	
	public Informe(Integer id) {
		super();
		this.id = id;
	}

}
