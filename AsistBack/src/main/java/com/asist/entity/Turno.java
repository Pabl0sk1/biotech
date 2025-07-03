package com.asist.entity;

import java.time.LocalTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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
@Table(name = "turnos")
public class Turno {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "turno_sec")
	@SequenceGenerator(name = "turno_sec", sequenceName = "turnos_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "tipoturno_id")
	TipoTurno tipoturno;
	
	@NotNull
	@NotBlank
	@NotEmpty
	@Size(max = 50)
	private String descripcion;

	@Column(name = "horaent")
	private LocalTime horaent;
	
	@Column(name = "horasal")
	private LocalTime horasal;
	
	@Column(name = "horades")
	private LocalTime horades;

	@Column(name = "thoras")
	private Integer thoras;
	
	@Column(name = "extporcen")
	private Integer extporcen;
	
	@OneToMany(mappedBy = "turno", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@JsonManagedReference
	@Size(min = 1)
	public List<TurnoDia> turnodia;
	
	public Turno(Integer id) {
		super();
		this.id = id;
	}
	
}
