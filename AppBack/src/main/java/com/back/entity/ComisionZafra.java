package com.back.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "comisionzafras")
public class ComisionZafra {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comisionzafra_sec")
	@SequenceGenerator(name = "comisionzafra_sec", sequenceName = "comisionzafras_id_seq", allocationSize = 1)
	private Integer id;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "comision_id")
	@JsonBackReference("comision-zafra")
	private Comision comision;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "zafra_id")
	private Zafra zafra;
	
	public ComisionZafra(Integer id) {
		super();
		this.id = id;
	}

}
