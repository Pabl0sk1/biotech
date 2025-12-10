package com.back.entity;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonProperty;
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
	name = "usuarios", 
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"nombreusuario"}, name = "usuario_uq1")
	}
)
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "usuario_sec")
	@SequenceGenerator(name = "usuario_sec", sequenceName = "usuarios_id_seq", allocationSize = 1)
	private Integer id;

	@NotNull
	@ManyToOne
	@JoinColumn(name = "tipousuario_id")
	private TipoUsuario tipousuario;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "sucursal_id")
	private Sucursal sucursal;

	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 20)
	private String nombreusuario;

	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 255)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String contrasena;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 100)
	private String nomape;

	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String nombre;
	
	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String apellido;

	@Size(max = 15)
	private String nrodoc;

	@Size(max = 15)
	private String nrotelefono;

	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 30)
	private String correo;
	
	@Size(max = 100)
	private String direccion;

	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 15)
	@Builder.Default
	private String estado = "Activo";
	
	@NotNull
	@Builder.Default
	private Boolean activo = true;
	
	@NotNull
	@Builder.Default
	private Boolean vermapa = false;
	
	@Temporal(TemporalType.DATE)
	private LocalDate fechanacimiento;
	
	public Usuario(Integer id) {
		super();
		this.id = id;
	}
	
}
