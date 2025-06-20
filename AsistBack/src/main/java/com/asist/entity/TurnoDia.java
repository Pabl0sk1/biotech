package com.asist.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "turnodias")
public class TurnoDia {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "turnodia_sec")
	@SequenceGenerator(name = "turnodia_sec", sequenceName = "turnodias_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "turno_id")
	@JsonBackReference
	Turno turno;
	
	@NotNull
	@NotBlank
	@NotEmpty
	@Size(max = 20)
	String dia;
	
}
