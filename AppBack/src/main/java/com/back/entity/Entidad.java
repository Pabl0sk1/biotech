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
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
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
@Table(name = "entidades")
public class Entidad {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "entidad_sec")
	@SequenceGenerator(name = "entidad_sec", sequenceName = "entidades_id_seq", allocationSize = 1)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "cargo_id")
	private Cargo cargo;
	
	@ManyToOne
	@JoinColumn(name = "sucursal_id")
	private Sucursal sucursal;
	
	@ManyToOne
	@JoinColumn(name = "cartera_id")
	private Cartera cartera;
	
	@NotNull
	@NotEmpty
	@NotBlank
	private String categorias;
	
	@Size(max = 150) 
	private String nomape;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 150)
	private String nombre;
	
	@Size(max = 150)
	private String apellido;
	
	@Size(max = 30)
	private String nrodoc;

	@Size(max = 30)
	private String nrotelefono;
	
	@Size(max = 30)
	private String correo;
	
	@Temporal(TemporalType.DATE)
	private LocalDate fechanacimiento;
	
	@Temporal(TemporalType.DATE)
	private LocalDate fechainicio;
	
	@Temporal(TemporalType.DATE)
	private LocalDate fechafin;
	
	private Double salario;
	
	private Integer codzktime;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 15)
	@Builder.Default
	private String estado = "Activo";
	
	@NotNull
	@Builder.Default
	private Boolean activo = true;
	
	private Integer erpid;
	
	public Entidad(Integer id) {
		super();
		this.id = id;
	}

}
