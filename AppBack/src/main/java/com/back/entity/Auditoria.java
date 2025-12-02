package com.back.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
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
@Table(name = "auditoria")
public class Auditoria {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "auditoria_sec")
	@SequenceGenerator(name = "auditoria_sec", sequenceName = "auditoria_id_seq", allocationSize = 1)
	private Integer id;

	@ManyToOne
	@NotNull
	@JoinColumn(name = "usuario_id")
	private Usuario usuario;
	
	@Column(name = "fecha")
	@Temporal(TemporalType.DATE)
	private LocalDate fecha;

	@Column(name = "fechahora")
	@Temporal(TemporalType.TIMESTAMP)
	private LocalDateTime fechahora;

	@Size(max = 20)
	private String programa;

	@Size(max = 20)
	private String operacion;

	@Column(name = "codregistro")
	private Integer codregistro;

	@Size(max = 20)
	private String ip;

	@Size(max = 30)
	private String equipo;

	public Auditoria(Integer id) {
		super();
		this.id = id;
	}

}
