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
@Table(name = "usuarios")
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
	@NotEmpty
	@NotBlank
	@Size(max = 20)
	private String nombreusuario;

	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 255)
	private String contrasena;

	@NotNull
	@NotEmpty
	@NotBlank
	@Size(max = 50)
	private String nombre;

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
	private Character estado;
	
	public Usuario(Integer id) {
		super();
		this.id = id;
	}
	
}
