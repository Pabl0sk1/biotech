package com.back.entity;

import java.time.LocalDate;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
	name = "vendedores", 
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"nrodoc"}, name = "vendedor_uq1")
	}
)
public class Vendedor {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vendedor_sec")
	@SequenceGenerator(name = "vendedor_sec", sequenceName = "vendedores_id_seq", allocationSize = 1)
	private Integer id;
	
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
	
	@Size(max = 30)
	private String correo;
	
	@Temporal(TemporalType.DATE)
	private LocalDate fechanacimiento;
	
	public Vendedor(Integer id) {
		super();
		this.id = id;
	}

}
