package com.back.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
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
@Table(name = "sucursales")
public class Sucursal {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sucursal_sec")
	@SequenceGenerator(name = "sucursal_sec", sequenceName = "sucursal_id_seq", allocationSize = 1)
	private Integer id;
	
	@Size(max = 30)
	private String sucursal;

}
