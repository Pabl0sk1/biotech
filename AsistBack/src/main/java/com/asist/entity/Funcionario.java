package com.asist.entity;

import jakarta.persistence.Column;
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
@Table(name = "funcionarios")
public class Funcionario {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "funcionario_sec")
	@SequenceGenerator(name = "funcionario_sec", sequenceName = "funcionarios_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "cargo_id")
	Cargo cargo;
	
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

	@Column(name = "salario")
	private Integer salario;
	
	@NotNull
	@Column(name = "codigo")
	private Integer codigo;

	public Funcionario(Integer id) {
		super();
		this.id = id;
	}
	
}
