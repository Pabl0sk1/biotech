package com.back.entity;

import java.time.LocalTime;
import java.util.List;
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
	name = "turnos", 
	uniqueConstraints = {
			@UniqueConstraint(columnNames = {"descripcion"}, name = "turno_uq1")
	}
)
public class Turno {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "turno_sec")
	@SequenceGenerator(name = "turno_sec", sequenceName = "turnos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "tipoturno_id")
	private TipoTurno tipoturno;
	
	@NotNull
	@NotBlank
	@NotEmpty
	@Size(max = 50)
	private String descripcion;

	@Temporal(TemporalType.TIME)
	private LocalTime horaent;
	
	@Temporal(TemporalType.TIME)
	private LocalTime horasal;
	
	@Temporal(TemporalType.TIME)
	private LocalTime horades;

	private Integer thoras;
	
	private Integer extporcen;
	
	@OneToMany(mappedBy = "turno", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JsonManagedReference
	@Size(min = 1)
	public List<TurnoDia> turnodia;
	
	public Turno(Integer id) {
		super();
		this.id = id;
	}
	
}
